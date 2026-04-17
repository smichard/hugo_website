---
title: "Extending the Local AI Stack with On-Demand GPU Inference on RunPod"
date: 2026-03-07
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Homelab"]
tags: ["homelab","AI","runpod","vllm","self-hosting"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_24/overview.png" title="Conceptual illustration of the extended AI stack with elastic cloud GPU resources for running large language models on demand - AI generated" >}}

# Introduction

In this post, I want to describe how I extended the local AI stack I built in my homelab with on-demand GPU-backed model inference, without adding any GPU hardware to the lab itself.

The two previous posts in this series provide the context for what follows. The [homelab post]({{< relref "post_18.md" >}}) covers the base infrastructure: thin clients, Docker Compose, Traefik, and internal DNS. The [local AI stack post]({{< relref "post_19.md" >}}) describes how *Open WebUI*, *LiteLLM*, *SearXNG*, and *Docling* sit on top of that infrastructure to form a self-hosted AI environment. That stack works well, and I have been using it for a while. Keeping the lab CPU-only is a deliberate choice. For orchestration, document workflows, and routing requests to publicly available AI services, dedicated GPU hardware at home is simply not necessary. When I want to try a particular model that is not available through a managed API, or experiment with something freshly released on Hugging Face, I rent the compute on demand rather than maintain it permanently.

The solution is straightforward: rent GPU capacity on demand from a specialized cloud provider, expose it as an OpenAI-compatible endpoint, and wire it into the existing stack. No new hardware, no permanent cost, no changes to the tools I already use.

## A Note on Neo Clouds

The providers that specialize in this type of GPU-first infrastructure are sometimes called *Neo Clouds*. The term emerged around 2024 to distinguish GPU-specialist vendors such as RunPod, CoreWeave and others from traditional hyperscalers. In practice, I am not sure the new term adds much. For me these are specialized cloud providers focused on GPU compute and AI workloads. Useful services, somewhat unnecessary branding.

## Why RunPod

I use [RunPod](https://www.runpod.io/) for this setup for a few practical reasons. The interface is intuitive, the deployment path from template to running pod is short, and the GPU catalog is broad enough to cover most use cases. Pricing is per second with no ingress or egress fees, which makes on-demand experimentation economical. RunPod also exposes an API for its core operations, so deployments can be automated rather than driven entirely through the UI.

A detailed description of all RunPod services is out of scope for this post. The focus here is on one specific workflow: deploying a *vLLM* inference server with a model loaded from *Hugging Face*, and connecting the resulting endpoint to Open WebUI.

# Deploying a vLLM Inference Server on RunPod

RunPod uses templates to save pod configurations for reuse. A template defines the container image, the start command, the storage allocation, and other runtime parameters. I maintain a small collection of private templates, each configured for a different model.

{{< figure src="/images/posts/post_24/list_of_private_templates.png" title="A selection of saved vLLM templates on RunPod, each pointing to a different model from Hugging Face" >}}

The container image for all of these templates is `vllm/vllm-openai:latest`, which bundles *vLLM* with an OpenAI-compatible API server. The model itself is specified in the container start command, which means swapping models is a matter of editing a single line rather than building a new image.

## Creating a Template

When creating or editing a template, the key fields are:

- **Type:** Pod
- **Compute type:** Nvidia GPU
- **Container image:** `vllm/vllm-openai:latest`
- **Container start command:** the vLLM arguments, including the model reference

{{< figure src="/images/posts/post_24/vllm_start_cmd.png" title="Template configuration for the vllm_gemma-3-12b template, showing the container image and start command" >}}

Throughout the following steps, any value written in `<angle brackets>` is a placeholder and must be replaced with your actual value before running the command.

A start command for deploying the `RedHatAI/Qwen3-8B-FP8-dynamic` model looks like this:

```bash
--host 0.0.0.0 --port 8000 \
  --model RedHatAI/Qwen3-8B-FP8-dynamic \
  --dtype bfloat16 \
  --enforce-eager \
  --gpu-memory-utilization 0.95 \
  --api-key <api_key> \
  --max-model-len 8128
```

The parameters worth noting:

- **`--model`**: any model available on Hugging Face can be referenced here by its repository path
- **`--dtype bfloat16`**: sets the compute dtype; `bfloat16` is a good default for inference on NVIDIA hardware
- **`--enforce-eager`**: disables CUDA graph capture, which reduces memory overhead at the cost of some throughput; useful when fitting larger models on a single GPU
- **`--gpu-memory-utilization 0.95`**: allows vLLM to use up to 95% of available GPU memory for the KV cache
- **`--api-key`**: sets a bearer token for the OpenAI-compatible endpoint; always set this when deploying a public endpoint
- **`--max-model-len`**: caps the maximum sequence length; reducing this frees memory and allows larger models to fit on smaller GPUs

## Selecting a GPU and Deploying

Once the template is configured, deploying it requires selecting a GPU and clicking deploy. RunPod shows available hardware with current pricing.

{{< figure src="/images/posts/post_24/gpu_selection.png" title="GPU selection on RunPod, ranging from RTX 3090 class cards to H200 and B200 datacenter accelerators" >}}

For most inference workloads with 8 to 12 billion parameter models, an RTX 4090 or L4 is a practical and cost-effective choice. Larger models with higher memory requirements will need 48 GB or 80 GB class cards. The per-hour pricing shown in the interface makes it easy to estimate cost for a session before committing.

After deployment, RunPod assigns a public HTTPS endpoint to the pod. The vLLM server is reachable at that endpoint on port 8000, with the path structure matching the OpenAI API.

# Connecting the Endpoint to Open WebUI

With the pod running, the endpoint can be added to Open WebUI as an external connection. In Open WebUI, navigate to **Admin Panel** then **Settings** and add a new connection with the following values:

- **Connection type:** External
- **URL:** `https://<runpod_endpoint>/v1`
- **Auth:** Bearer, with the API key set in the vLLM start command
- **Provider type:** OpenAI
- **API type:** Chat Completions

{{< figure src="/images/posts/post_24/open_webui_configuration.png" title="Adding the RunPod vLLM endpoint as an external OpenAI-compatible connection in Open WebUI" >}}

Once saved, the model served by vLLM on RunPod appears in the model selector alongside any other configured backends. From a user perspective, the interface is identical to any other configured model, whether local or a commercial API.

Alternatively, the endpoint can be added to LiteLLM as a named model alias. This is the better option if you want centralized credential management or want to expose the RunPod model alongside other backends under a consistent naming scheme across the stack.

# Why This Setup Works Well

The combination of a self-hosted orchestration stack and on-demand GPU inference fits well with a homelab where tooling and workflows are in place but on-premises compute is intentionally kept lean.

A few things make this pattern practical:

- **Low cost for experimentation.** Models run only when needed. A session of an hour or two to test a new model costs a few dollars at most.
- **Access to current models.** Any model available on Hugging Face can be loaded into vLLM, which means it is straightforward to test recently released models without waiting for them to appear in a managed API.
- **No changes to the existing stack.** Open WebUI, LiteLLM, SearXNG, and Docling continue to work exactly as before. The RunPod endpoint is just another backend.
- **Automatable.** RunPod exposes an API for managing pods, so deployments can be triggered programmatically. Combined with LiteLLM's routing, it becomes possible to bring a model endpoint up on demand and tear it down again when it is no longer needed.

# Conclusion

Adding RunPod as an on-demand GPU backend closes the main gap in a CPU-only homelab AI stack. The setup requires no changes to the existing infrastructure and takes only a few minutes from template to running endpoint. The result is the ability to experiment with current, capable models at low cost, using the same interface and workflows already in place.

For on-demand model access that does not warrant the cost of persistent GPU hardware, this pattern is worth considering.

# References

- My Homelab: A Traefik-centered Self-hosting Setup - [link]({{< relref "post_18.md" >}})
- My Local AI Stack: Open WebUI, LiteLLM, SearXNG, and Docling - [link]({{< relref "post_19.md" >}})
- RunPod - project site - [link](https://www.runpod.io/)
- RunPod - documentation - [link](https://docs.runpod.io/overview)
- vLLM - project site - [link](https://docs.vllm.ai/)
- Hugging Face - model hub - [link](https://huggingface.co/models)
- RedHatAI models on Hugging Face - [link](https://huggingface.co/RedHatAI)
