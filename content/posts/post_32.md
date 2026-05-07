---
title: "Running the Red Hat AI Inference Server on OpenShift"
date: 2027-04-22
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["OpenShift"]
tags: ["openshift", "ai", "vllm", "inference", "open-webui"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_32/overview.png" title="Drop-in OpenAI-compatible inference on OpenShift — RHAIIS packages vLLM for production, with hardware flexibility and a secure external endpoint out of the box - AI generated" >}}

## Introduction

In this post, I want to describe how to deploy the **Red Hat AI Inference Server (RHAIIS)** on OpenShift and expose it as an OpenAI-compatible API endpoint. This post builds on [Deploying OpenShift on AWS with Automated Cluster Provisioning]({{< relref "post_20.md" >}}), which covers getting a working OpenShift cluster into place. If you already have a cluster running, you can skip directly to the deployment steps.

The inference server will load a model from Hugging Face Hub and expose a `/v1/chat/completions` endpoint that any OpenAI-compatible client can talk to. At the end, I show how to connect the endpoint to the [Open WebUI](https://openwebui.com/) setup described in [My Local AI Stack]({{< relref "post_19.md" >}}).

## What is Red Hat AI Inference Server

*vLLM* is an open-source inference engine designed for high-throughput LLM serving. It handles memory-efficient attention via *PagedAttention*, continuous batching, and GPU-optimized execution, and it exposes an OpenAI-compatible HTTP API out of the box. I covered how to run vLLM on the GPU cloud provider RunPod in a [previous post]({{< relref "post_24.md" >}}).

The **Red Hat AI Inference Server** is the supported, enterprise-packaged distribution of vLLM. Red Hat provides a hardened container image distributed through `registry.redhat.io`, tested against specific GPU driver and CUDA versions and with a defined support lifecycle. The API surface is identical to upstream vLLM. Any client that works against a plain vLLM inference server works against RHAIIS without modification.

Deploying RHAIIS directly on OpenShift is one way to reach a running inference endpoint through Red Hat technology. Red Hat OpenShift AI offers other paths, e.g. model serving through KServe, where OpenShift AI manages the deployment lifecycle via a web dashboard and exposes RHAIIS through a `ServingRuntime`, or a [Model as a Service](https://github.com/opendatahub-io/models-as-a-service) approach that provisions shared inference endpoints across a cluster, so teams can consume models without operating their own deployment. The approach in this post is the most direct option, suited for cases where you want a single inference endpoint.

## Prerequisites

This setup requires the following:

- A running OpenShift cluster with at least one GPU-enabled worker node. The post [Deploying OpenShift on AWS]({{< relref "post_20.md" >}}) covers one way to get there.
- [**Node Feature Discovery (NFD) Operator**](https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/specialized_hardware_and_driver_enablement/psap-node-feature-discovery-operator) installed and running to detect GPU hardware on the node.
- [**NVIDIA GPU Operator**](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) installed to provide the CUDA runtime and device plugin.
- [**OpenShift CLI (oc)**](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started) – required to interact with the OpenShift cluster, installed and logged into the cluster.
- A Hugging Face access token if you intend to use a gated model. Publicly available models like [Granite](https://huggingface.co/ibm-granite/collections) do not require one.

## Deploying the Red Hat AI Inference Server

The deployment consists of a namespace, two secrets, a PersistentVolumeClaim for model caching, a Deployment, a Service, and a Route. All deployment files are available in the [smichard/agent_on_ocp](https://github.com/smichard/agent_on_ocp) GitHub repository. The steps below apply them in sequence.

1. Clone the repository:
```bash
git clone https://github.com/smichard/agent_on_ocp.git
cd rhaiis
```

2. Create a Namespace
```bash
oc new-project rhaiis
```

3. Create the required Secrets

**Hugging Face access token:**

```bash
oc create secret generic hf-secret \
  --from-literal=HF_TOKEN=<your_huggingface_token> \
  -n rhaiis
```

**API key for the inference endpoint:**

The server requires clients to present an API key as a bearer token. Storing it as a secret keeps it out of the Deployment spec.

```bash
oc create secret generic vllm-api-key-secret \
  --from-literal=VLLM_API_KEY=$(openssl rand -hex 32) \
  -n rhaiis
```

4. Create the ConfigMap

Set the Hugging Face model ID you want to serve. Any model supported by vLLM works here. Research which model fits your use case before settling on one, the only hard requirement is that it is support to run using the vLLM inference server.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vllm-config
  namespace: rhaiis
data:
  MODEL_NAME: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
```

Apply the file to create the ConfigMap:
```bash
oc apply -f configmap.yaml
```

5. Create a PersistentVolumeClaim

The model weights are downloaded once on first startup and cached on a persistent volume. This avoids re-downloading the model on every pod restart.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-cache
  namespace: rhaiis
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 150Gi
```

Apply the file to create the PVC:
```bash
oc apply -f pvc.yaml
```

6. Deploy the Inference Server

The Deployment below references the RHAIIS container image and pulls the model ID from the ConfigMap created in step 4. To serve a different model, update the ConfigMap rather than editing the Deployment spec. The `HF_TOKEN` and `VLLM_API_KEY` values are injected from the secrets created in step 3.

{{< notice note >}}
Depending on the model size, the number of GPUs and the CPU and memory allocations will need to be adjusted. The example below was tested on an AWS `g5.12xlarge` node (4x NVIDIA A10G, 24 GB VRAM per GPU) and uses all four GPUs via tensor parallelism.
{{< /notice >}}

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rhaiis-vllm
  namespace: rhaiis
  labels:
    app: rhaiis-vllm
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rhaiis-vllm
  template:
    metadata:
      labels:
        app: rhaiis-vllm
    spec:
      tolerations:
        - key: nvidia.com/gpu
          effect: NoSchedule
          operator: Exists
      serviceAccountName: default
      volumes:
        - name: model-cache
          persistentVolumeClaim:
            claimName: model-cache
        - name: shm
          emptyDir:
            medium: Memory
            sizeLimit: "16Gi"
      containers:
        - name: vllm
          image: registry.redhat.io/rhaiis/vllm-cuda-rhel9:latest
          imagePullPolicy: Always
          env:
            - name: HF_TOKEN
              valueFrom:
                secretKeyRef:
                  name: hf-secret
                  key: HF_TOKEN
            - name: VLLM_API_KEY
              valueFrom:
                secretKeyRef:
                  name: vllm-api-key-secret
                  key: VLLM_API_KEY
            - name: MODEL_NAME
              valueFrom:
                configMapKeyRef:
                  name: vllm-config
                  key: MODEL_NAME
            - name: HF_HOME
              value: /cache
            - name: HF_HUB_OFFLINE
              value: '0'
            - name: VLLM_ALLOW_LONG_MAX_MODEL_LEN
              value: '1'
          command:
            - python
            - '-m'
            - vllm.entrypoints.openai.api_server
          args:
            - '--port=8000'
            - '--model=$(MODEL_NAME)'
            - '--served-model-name=$(MODEL_NAME)'
            - '--tensor-parallel-size=4'
            - '--gpu-memory-utilization=0.85'
            - '--max-model-len=65536'
            - '--enable-auto-tool-choice'
            - '--tool-call-parser=hermes'
          resources:
            limits:
              cpu: '10'
              nvidia.com/gpu: '4'
              memory: 128Gi
            requests:
              cpu: '2'
              memory: 32Gi
              nvidia.com/gpu: '4'
          volumeMounts:
            - name: model-cache
              mountPath: /cache
            - name: shm
              mountPath: /dev/shm
      restartPolicy: Always
```

Apply the file to create the deployment:
```bash
oc apply -f deployment.yaml
```

The container reads the model ID from the ConfigMap at startup and downloads it from HuggingFace into `/cache` (backed by the PVC). Initial startup takes several minutes depending on model size and network speed.
Follow the progress with:

```bash
oc logs -f deployment/rhaiis-vllm -n rhaiis
```

The server is ready when the log shows `Application startup complete`.
{{< figure src="/images/posts/post_32/vllm_startup.png" title="vLLM server log output on startup, showing all registered API routes and the final Application startup complete confirmation" >}}


Once the pod is running, you can verify GPU access from the pod terminal with `nvidia-smi`. All four GPUs should be visible, each running a tensor-parallel worker process.

{{< figure src="/images/posts/post_32/nvidia_smi.png" title="nvidia-smi output from inside the vLLM pod, confirming all four A10G GPUs are visible and each tensor-parallel worker has allocated roughly 20 GB of VRAM" >}}


7. Create a Service and Route

Create a Service that maps port 80 to port 8000 on the pod:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rhaiis-vllm
  namespace: rhaiis
  labels:
    app: rhaiis-vllm
spec:
  selector:
    app: rhaiis-vllm
  ports:
    - name: http
      protocol: TCP
      port: 8000
      targetPort: 8000
```

Create a TLS-terminated Route if you want to expose the endpoint outside the cluster:

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: rhaiis-vllm
  namespace: rhaiis
  labels:
    app: rhaiis-vllm
spec:
  to:
    kind: Service
    name: rhaiis-vllm
  port:
    targetPort: http
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
```

Apply both and retrieve the assigned hostname:
```bash
oc apply -f service.yaml
oc apply -f route.yaml
oc get route rhaiis-vllm -n rhaii-namespace -o jsonpath='{.spec.host}'
```

OpenShift builds the hostname from the route and namespace names following the pattern `<route-name>-<namespace>.apps.<cluster-domain>`. The result looks something like `rhaiis-vllm-rhaiis-namespace.apps.ocp.example.com`.

## Testing the Endpoint

Store the hostname and API key in shell variables to keep the commands readable:

Set environment variables once:

```bash
export RHAIIS_HOST=$(oc get route rhaiis-vllm -n rhaiis -o jsonpath='{.spec.host}')
export RHAIIS_API_KEY=$(oc get secret vllm-api-key-secret -n rhaiis \
  -o jsonpath='{.data.VLLM_API_KEY}' | base64 -d)
export MODEL=$(oc get configmap vllm-config -n rhaiis \
  -o jsonpath='{.data.MODEL_NAME}')
```

Verify all three are populated before proceeding:

```bash
echo "RHAIIS_HOST : ${RHAIIS_HOST}"
echo "RHAIIS_API_KEY  : ${RHAIIS_API_KEY}"
echo "Model: ${MODEL}"

**List available models:**

```bash
curl -s https://$RHAIIS_HOST/v1/models \
  -H "Authorization: Bearer $RHAIIS_API_KEY" | jq .
```

**Send a chat completion request:**

```bash
curl -sS \
  "https://${RHAIIS_HOST}/v1/chat/completions" \
  -H "Authorization: Bearer ${RHAIIS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"${MODEL}"'",
    "messages": [{"role": "user", "content": "What is OpenShift?"}],
    "temperature": 0.1,
    "max_tokens": 200
  }' | jq -r '.choices[0].message.content'
```

A successful response confirms the server is running, the model is loaded, and the API key authentication is working.

## Connecting to Open WebUI

The inference server exposes a standard OpenAI-compatible API, which means *Open WebUI* can connect to it directly as an external provider. The setup in [My Local AI Stack]({{< relref "post_19.md" >}}) already runs Open WebUI. Adding the RHAIIS endpoint as a direct external connection requires no changes to the existing stack.

In Open WebUI, go to **Settings > Connections** and add a new external connection. Set the URL to the route hostname with the `/v1` suffix, add the API key created in step 3 as a bearer token, set the provider type to **OpenAI**, and the API type to **Chat Completions**. Leave the model ID field empty so Open WebUI queries the `/v1/models` endpoint and discovers available models automatically.

{{< figure src="/images/posts/post_32/open_webui.png" title="Open WebUI external connection configured against the Red Hat AI Inference Server endpoint" >}}

Once saved, the deployed model appears in the model selector alongside any other configured providers.

## Conclusion

The Red Hat AI Inference Server puts the vLLM engine into OpenShift, or any other supported platform, with a supported container image and a deployment pattern that fits standard Kubernetes workflows. The outcome is an OpenAI-compatible endpoint running on your own cluster, backed by a model from Hugging Face Hub, secured with an API key, and accessible over a TLS-terminated OpenShift Route. Any client that speaks the OpenAI Chat Completions format can talk to it, including Open WebUI, which connects to it the same way it connects to any other provider.

## References

- GitHub repository with eployment files - [link](https://github.com/smichard/agent_on_ocp)
- Deploying OpenShift on AWS with Automated Cluster Provisioning - [link]({{< relref "post_20.md" >}})
- My Local AI Stack: Open WebUI, LiteLLM, SearXNG, and Docling - [link]({{< relref "post_19.md" >}})
- Extending the Local AI Stack with On-Demand GPU Inference on RunPod - [link]({{< relref "post_24.md" >}})
- Model as a Service GitHub repository - [link](https://github.com/opendatahub-io/models-as-a-service)
- Node Feature Discovery Operator - [link](https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/specialized_hardware_and_driver_enablement/psap-node-feature-discovery-operator)
- NVIDIA GPU Operator - [link](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html)
- OpenShift CLI (oc) - [link](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started)
- Granite family of models on Hugging Face - [link](https://huggingface.co/ibm-granite/collections)
- smichard/agent_on_ocp - GitHub repository - [link](https://github.com/smichard/agent_on_ocp)
- Red Hat AI Inference Server - Documentation - [link](https://docs.redhat.com/en/documentation/red_hat_ai_inference_server/3.4)
- Deploying Red Hat AI Inference Server on OpenShift - [link](https://docs.redhat.com/en/documentation/red_hat_ai_inference_server/3.4/html-single/deploying_red_hat_ai_inference_server_in_openshift_container_platform/index)
- vLLM - upstream project - [link](https://github.com/vllm-project/vllm)
- vLLM - OpenAI-compatible server documentation - [link](https://docs.vllm.ai/en/stable/serving/openai_compatible_server/)
- Open WebUI - project site - [link](https://openwebui.com/)