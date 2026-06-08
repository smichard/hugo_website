---
title: "Deploying OpenClaw on OpenShift"
date: 2026-06-07
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["OpenShift"]
tags: ["openshift", "ai", "openclaw", "agent", "vllm"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_36/overview.png" title="The claw-installer automates the full OpenShift deployment in minutes, including authentication and TLS-terminated route - AI generated" >}}

## Introduction

In this post, I want to describe how to deploy *OpenClaw* on OpenShift using a browser-based installer. It is possible to configure OpenClaw to use a self-hosted model endpoint. This post builds on [Running the Red Hat AI Inference Server on OpenShift]({{< relref "post_32.md" >}}) for the model serving layer and sits alongside the [Hermes Agent deployment post]({{< relref "post_33.md" >}}) as a second option for running an AI agent on the same cluster.

The two approaches are different in character. Hermes uses YAML manifests applied to OpenShift, requires a custom ServiceAccount with the `anyuid` SCC, and is configured through environment variables and a config file. For OpenClaw it is possible to leverage the [claw-installer](https://github.com/sallyom/claw-installer) repository, a community supported tool that automates the deployment of OpenClaw on OpenShift. The claw-installer uses a browser-based installer that generates and applies all manifests, runs inside the default `restricted-v2` SCC without elevated permissions, and handles OpenShift OAuth authentication automatically through a sidecar container.

## What is OpenClaw

[OpenClaw](https://openclaw.ai/) is an open-source agent framework designed to run on your own infrastructure. It connects to model providers, integrates with messaging platforms, and exposes a web interface for interacting with an agent.

[Peter Steinberger](https://github.com/steipete) created OpenClaw in late 2025. The project gained traction quickly: by early 2026 it had become the most-starred software project in GitHub's history, [overtaking repositories](https://www.star-history.com/blog/openclaw-surpasses-react-most-starred-software/) that had accumulated stars over decades. At the [NVIDIA GTC keynote](https://www.youtube.com/watch?v=jw_o0xr8MWU&list=PL5B692fm6--tiaBq8Gc0ZenDDcvk_8vEL) in March 2026, NVIDIA CEO Jensen Huang put it directly: "OpenClaw is the number one. It is the most popular open-source project in the history of humanity, and it did so in just a few weeks."

{{< figure src="/images/posts/post_36/star_history.png" title="GitHub Star History of OpenClaw relative to the Linux and React projects - [Source](https://www.star-history.com/blog/openclaw-surpasses-react-most-starred-software/)" >}}

The gateway is the always-on component. It manages sessions, routes requests between channels, dispatches tool calls, and emits events. On OpenShift, it runs as a three-container pod: an init container that handles startup configuration, an OAuth-proxy sidecar that ties authentication to the OpenShift OAuth server, and the OpenClaw gateway itself. The pod runs under the default `restricted-v2` SCC.

OpenClaw supports the Model Context Protocol for tool integration. An `mcp.json` file placed in the agent workspace directory provisions MCP servers at deploy time, and the installer merges it into the main configuration.

## Prerequisites

- A running OpenShift cluster. The post [Deploying OpenShift on AWS]({{< relref "post_20.md" >}}) covers one way to get there.
- The RHAIIS deployment from [Running the Red Hat AI Inference Server on OpenShift]({{< relref "post_32.md" >}}) running in the `rhaiis` namespace, or an external model provider API key if you prefer a AI model as a service.
- Node.js 22 or later installed locally.

## Deploying OpenClaw

1. Create a namespace:

```bash
oc new-project openclaw
```

2. Clone the installer:

```bash
git clone https://github.com/sallyom/claw-installer.git
cd claw-installer
```

3. Start the installer:

```bash
npm install && npm run build && npm run dev
```

The installer starts a local web server on port 3000. Open `http://localhost:3000` in a browser.

4. Configure the deployment in the installer UI.

In the Deploy tab, select **OpenShift** as the deployment target. The installer reads the current `oc` context to detect the cluster and active namespace. Fill in the configuration form:

- **Agent Name:** a name of your choice for your agent
- **Project / Namespace:** the namespace to deploy the agent into, the installer pre-fills this from the current namespace in the `oc` context
- **Inference providers:** add one or more model backends, for each provider specify the model endpoint, the model name, and the API key

{{< figure src="/images/posts/post_36/claw_installer.png" title="OpenClaw Installer available at *localhost:3000*" >}}

If using RHAIIS as the model provider, the internal service DNS name keeps all model traffic inside the cluster. Retrieve the API key from the `rhaiis` namespace before filling in the form:

```bash
export MODEL_API_KEY=$(oc get secret vllm-api-key-secret -n rhaiis \
  -o jsonpath='{.data.VLLM_API_KEY}' | base64 -d)
echo $MODEL_API_KEY
```

Set the model endpoint to the internal cluster address:

```
http://rhaiis-vllm.rhaiis.svc.cluster.local:8000/v1
```

5. Click **Deploy OpenClaw**.

The installer generates and applies all manifests against the active cluster context. In the target namespace it creates a ServiceAccount with OpenShift OAuth annotations, secrets for the OAuth client and the gateway token, ConfigMaps for the agent configuration and workspace files, a 10Gi PVC backed by block storage, a Deployment running the three-container pod, a Service, and a TLS-terminated Route using the cluster wildcard certificate.

Once the pod reaches Running status, the OpenShift Topology view shows the deployment with two services: the gateway on port 18789 and the OAuth proxy on port 8443.

{{< figure src="/images/posts/post_36/openclaw_topology.png" title="The openclaw deployment in the OpenShift Topology view, showing the pod, the gateway service on port 18789 and the OAuth proxy on port 8443 and the route" >}}

6. Retrieve the gateway token:

```bash
export OPENCLAW_HOST=$(oc get route openclaw -n openclaw \
  -o jsonpath='{.spec.host}')
export OPENCLAW_GATEWAY_TOKEN=$(oc get secret openclaw-secrets -n openclaw \
  -o jsonpath='{.data.OPENCLAW_GATEWAY_TOKEN}' | base64 -d)

echo "OPENCLAW_HOST          : ${OPENCLAW_HOST}"
echo "OPENCLAW_GATEWAY_TOKEN : ${OPENCLAW_GATEWAY_TOKEN}"
```

7. Open the Route in a browser.

OpenShift OAuth handles authentication automatically. Log in with your cluster credentials when prompted. After login, the OpenClaw gateway dashboard appears. Paste the gateway token into the **Gateway-Token** field to authenticate the browser session with the running gateway.

{{< figure src="/images/posts/post_36/openclaw_gateway.png" title="The OpenClaw Gateway-Dashboard after the authentication step, showing the WebSocket connection URL and the Gateway-Token field used to authenticate the browser session" >}}

8. Approve the pairing in the installer.

Go back to the installer at `http://localhost:3000`, open the **Instances** tab, find the running instance, and click **Approve Pairing**. This confirms the connection between the local installer session and the cluster deployment.

{{< figure src="/images/posts/post_36/openclaw_instances.png" title="The claw-installer Instances tab showing the openclaw deployment running on OpenShift, with the Approve Pairing control and other management options" >}}

Once the pairing is approved, the web interface is ready. The chat window connects to the configured model backend and the agent shows as ready. The OpenClaw dashboard can be used to further configure the agent, for example adding additional model providers or connecting messaging platforms.

{{< figure src="/images/posts/post_36/openclaw_dashboard.png" title="OpenClaw Dashboard Overview" >}}

The OpenClaw gateway can expose an OpenAI-compatible API, so adding it as a connection in *Open WebUI* follows the same steps described in the [Running the Red Hat AI Inference Server on OpenShift]({{< relref "post_32.md" >}}) and [Deploying Hermes Agent on OpenShift]({{< relref "post_33.md" >}}) posts.

## Conclusion

OpenClaw on OpenShift is a different path compared to the Hermes Agent deployment covered in the previous post. The installer handles all manifest generation from a web form, and the result is a running agent in minutes without writing any YAML. The OpenShift OAuth sidecar covers authentication from the start, using existing cluster credentials rather than a separately managed API key. The pod runs under the default `restricted-v2` security policy, which matters in environments where elevated SCCs require explicit approval from a cluster administrator.

If RHAIIS is already running on the same cluster, pointing OpenClaw at the internal service address keeps all model traffic off the public network. Both agents can run on the same cluster in separate namespaces without any conflict.

## References

- Running the Red Hat AI Inference Server on OpenShift - [link]({{< relref "post_32.md" >}})
- Deploying Hermes Agent on OpenShift - [link]({{< relref "post_33.md" >}})
- claw-installer - GitHub repository - [link](https://github.com/sallyom/claw-installer)
- OpenClaw Project website - [link](https://openclaw.ai/) 
- Peter Steinbergers GitHub Profile - [link](https://github.com/steipete)
- OpenClaw surpasses React as most-starred software on GitHub - [link](https://www.star-history.com/blog/openclaw-surpasses-react-most-starred-software/)
- NVIDIA GTC 2026 Keynote - YouTube - [link](https://www.youtube.com/watch?v=jw_o0xr8MWU&list=PL5B692fm6--tiaBq8Gc0ZenDDcvk_8vEL)
- Nvidia CEO Jensen Huang says OpenClaw is "definitely the next ChatGPT" - CNBC - [link](https://www.cnbc.com/2026/03/17/nvidia-ceo-jensen-huang-says-openclaw-is-definitely-the-next-chatgpt.html)
- Deploying OpenShift on AWS with Automated Cluster Provisioning - [link]({{< relref "post_20.md" >}})
- Deploying agents with Red Hat AI: The curious case of OpenClaw - [link](https://developers.redhat.com/articles/2026/04/14/deploying-agents-red-hat-ai-openclaw)
- OpenClaw - GitHub repository - [link](https://github.com/openclaw/openclaw)