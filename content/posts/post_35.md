---
title: "AI-Assisted Coding with OpenShift Dev Spaces"
date: 2027-04-26
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["OpenShift"]
tags: ["openshift", "devspaces", "ai", "vllm", "coding-assistant"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_35/overview.png" title="Comparison between legacy local development and OpenShift Dev Spaces with in-cluster RHAIIS inference — AI generated" >}}

## Introduction

In this post, I want to describe how to configure *Red Hat OpenShift Dev Spaces* for AI-assisted code generation with a private model server by connecting a coding assistant extension to the *Red Hat AI Inference Server (RHAIIS)* running on the same cluster. Team mates published a similar setup [more than two years ago](https://www.opensourcerers.org/2023/11/06/a-personal-ai-assistant-for-developers-that-doesnt-phone-home/), using Ollama as the local inference server. The idea was to give developers an AI coding assistant that never sends data to an external API. That principle still applies.

This post updates the pattern with a different backend. RHAIIS was covered in an [earlier post in this series]({{< relref "post_32.md" >}}). The model request from the editor goes to an internal Kubernetes service address and never leaves the cluster network.

## OpenShift Dev Spaces

*OpenShift Dev Spaces* is Red Hat's cloud development environment solution. The upstream project is [Ecliptse Che](https://eclipse.dev/che/). Dev Spaces is available through OperatorHub and is included with an OpenShift subscription.

After installing the operator, the next step is creating a *CheCluster* resource, which provisions the Dev Spaces control plane. Once it is up, the Dev Spaces interface is accessible through the OpenShift web console via the application launcher in the top-right corner.

{{< figure src="/images/posts/post_35/launch_devspaces.png" title="OpenShift web console application launcher with the Red Hat OpenShift Dev Spaces entry" >}}

The core workflow is simple: paste a git repository URL into the Dev Spaces interface, and the platform creates a containerized workspace from a `devfile` in the repository root. The workspace runs as a pod on the same cluster, which is what makes the internal service address approach work. A workspace pod and a RHAIIS pod can reach each other the same way any two pods on the same cluster can.

{{< figure src="/images/posts/post_35/start_workspace.png" title="Create Workspace by providing a git repository link" >}}

## The devfile

A `devfile` is the environment definition for a Dev Spaces workspace. It declares the container image, resource limits, source mount path, and lifecycle commands. The [smichard/agent_on_ocp](https://github.com/smichard/agent_on_ocp) repository, used throughout this series, contains the following `devfile.yaml`:

```yaml
schemaVersion: 2.2.0
metadata:
  name: code-assistant
  label: code-assistant
attributes:
  controller.devfile.io/storage-type: ephemeral
components:
- name: udi
  container:
    image: quay.io/michard/devspaces_base_image:0.1.29
    memoryLimit: 4Gi
    memoryRequest: 2Gi
    cpuLimit: 4000m
    cpuRequest: 1000m
    mountSources: true
    sourceMapping: /projects
commands:
  - id: copyconfig
    exec:
      component: udi
      commandLine: "mkdir -p /home/user/.continue && cp /projects/agent-on-ocp/continue-config.yaml /home/user/.continue/config.yaml"
events:
  postStart:
    - copyconfig
```

A few things to note. The `storage-type: ephemeral` attribute means the workspace uses no persistent volume. Each workspace restart begins from a clean container state.

The custom image `quay.io/michard/devspaces_base_image:0.1.29` bundles the tooling the project needs. Using a project-specific image means the workspace is ready to use the moment it starts, without any post-launch installation steps.

The `postStart` event runs the `copyconfig` command every time the workspace starts. It copies `continue-config.yaml` from the project directory to `~/.continue/config.yaml`, which is where the Continue extension reads its configuration. Because the config lives in the repository, any update to it is picked up the next time someone opens a workspace from that repository.

## The Continue configuration

The AI coding extension used here is [Continue](https://www.continue.dev/), an open-source VS Code extension that provides chat, inline editing, autocomplete, and agent mode. It is available through [Open VSX](https://open-vsx.org/), which is the extension registry OpenShift Dev Spaces uses. There are other extensions that work with OpenAI-compatible APIs in the same way; Continue is the example in this post. The repository includes VS Code configuration files that instruct the editor to install the extension automatically on workspace startup, so no manual installation is required.

The `continue-config.yaml` below is a minimal example. It defines two model entries against the RHAIIS endpoint and a local embedding model. For a full reference of available options, see the [Continue configuration reference](https://docs.continue.dev/reference):

```yaml
name: Agent on OCP
version: 0.1.0
schema: v1

models:
  - name: Qwen3 Coder 30B
    provider: openai
    model: Qwen/Qwen3-Coder-30B-A3B-Instruct
    apiBase: http://rhaiis-vllm.rhaiis.svc.cluster.local:8000/v1
    apiKey: ${{ secrets.RHAIIS_API_KEY }}
    roles:
      - chat
      - edit
      - apply
      - summarize
    capabilities:
      - tool_use
    defaultCompletionOptions:
      temperature: 0.2
      maxTokens: 4096

  - name: Qwen3 Coder 30B Autocomplete
    provider: openai
    model: Qwen/Qwen3-Coder-30B-A3B-Instruct
    apiBase: http://rhaiis-vllm.rhaiis.svc.cluster.local:8000/v1
    apiKey: ${{ secrets.RHAIIS_API_KEY }}
    roles:
      - autocomplete
    autocompleteOptions:
      debounceDelay: 300
      maxPromptTokens: 1024
      onlyMyCode: true
    defaultCompletionOptions:
      temperature: 0.1
      maxTokens: 512

  - name: Local Embeddings
    provider: transformers.js
    model: all-MiniLM-L6-v2
    roles:
      - embed
```

The `apiBase` uses the internal Kubernetes DNS name for the RHAIIS service. Since the Dev Spaces workspace runs as a pod on the same cluster, this address resolves without any additional configuration.

The config separates the chat and autocomplete roles into two model entries. Autocomplete benefits from lower temperature and a shorter token budget to keep response latency acceptable. The local embedding model handles context search without calling the inference server at all.

The full configuration also includes a set of context providers (file, diff, terminal, repository map, and others), custom prompt templates for tasks like OpenShift manifest review and security scanning, and rules that constrain suggestions toward `oc` CLI examples and away from committing secrets.

## Adding the API Key

The one piece that cannot live in the repository is the API key. Continue reads secrets from a `.continue/.env` file in the project directory. The key is the RHAIIS API key that was created when the inference server was deployed.

Inside the Dev Spaces workspace terminal, run:

```bash
mkdir -p .continue
oc get secret vllm-api-key-secret -n rhaiis -o jsonpath='{.data.VLLM_API_KEY}' | base64 -d | awk '{print "RHAIIS_API_KEY="$0}' > .continue/.env
```

This retrieves the key from the `rhaiis` namespace and writes it to `.continue/.env` as `RHAIIS_API_KEY=<value>`. Continue picks it up wherever `${{ secrets.RHAIIS_API_KEY }}` appears in the config.

If the extension does not connect immediately, reload the browser tab. Continue reads its configuration and secrets at startup, and a fresh page load is sometimes needed after the `.env` file is created.

Because the workspace uses ephemeral storage, the `.env` file does not survive a workspace restart. Running the two commands again after each restart is the only manual step in the workflow.

Make sure `.continue/.env` is listed in the repository's `.gitignore` file to avoid accidentally committing it to the git repository.

{{< figure src="/images/posts/post_35/continue.png" title="tbd" >}}

## Conclusion

With RHAIIS and Dev Spaces both on the same OpenShift cluster, the complete path from editor to model runs over the internal service network. The repository carries the workspace definition, the tooling, and the AI extension configuration. The only input that cannot come from the repository is the API key, which is one command to retrieve from an existing Kubernetes secret.

From there, you have a private model on a private cluster available as a coding assistant. The vibe coding can begin.

## References

- A personal AI assistant for developers that doesn't phone home - [link](https://www.opensourcerers.org/2023/11/06/a-personal-ai-assistant-for-developers-that-doesnt-phone-home/)
- Running the Red Hat AI Inference Server on OpenShift - [link](post_32.md)
- Eclipse Che - upstream project - [link](https://eclipse.dev/che/)
- smichard/agent_on_ocp - GitHub repository - [link](https://github.com/smichard/agent_on_ocp)
- Continue - project site - [link](https://www.continue.dev/)
- Open VSX Registry - [link](https://open-vsx.org/)
- Continue - configuration reference - [link](https://docs.continue.dev/reference)
- Continue - documentation - [link](https://docs.continue.dev/)
- Red Hat OpenShift Dev Spaces - product page - [link](https://developers.redhat.com/products/openshift-dev-spaces)
- Red Hat OpenShift Dev Spaces - documentation - [link](https://docs.redhat.com/en/documentation/red_hat_openshift_dev_spaces/)
