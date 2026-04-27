---
title: "Installing OpenShift AI on OpenShift"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["OpenShift"]
tags: ["openshift","aws","gitops","gpu","nvidia","rhoai"]
toc:
  enable: false
---

## Introduction

In this post, I want to describe how to install **Red Hat OpenShift AI** on an existing OpenShift cluster and configure it to run GPU-accelerated workloads. The approach uses the [rhoai-gitops](https://github.com/alvarolop/rhoai-gitops) repository, created and maintained by my colleague **Álvaro López Medina**, which automates the installation of OpenShift AI, the required operators, and the NVIDIA GPU stack through a single script backed by a *GitOps* approach.

If you do not have an OpenShift cluster available yet and want to provision one on AWS, a previous post [Deploying OpenShift on AWS with Automated Cluster Provisioning]({{< relref "post_20.md" >}}) covers exactly that. The steps below pick up where that post leaves off, though they apply equally to any running OpenShift cluster.

## Prerequisites

Before proceeding, ensure the following are in place:

- A running OpenShift cluster with sufficient compute capacity
- The [OpenShift CLI (oc)](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started) installed and available on your workstation
- Cluster-admin access
- If GPU support is needed: sufficient AWS quota for GPU instance types (e.g., `g5.4xlarge`)

## Installing OpenShift AI

### Cloning the repository

1. Clone the [rhoai-gitops](https://github.com/alvarolop/rhoai-gitops) repository:
```bash
git clone https://github.com/alvarolop/rhoai-gitops
cd rhoai-gitops
```

### Configuring the installation

2. Open the installation script and review the GPU-related configuration:
```bash
vi auto-install.sh
```

The three parameters that matter most for GPU-enabled deployments:

- **`CREATE_GPU_MACHINESETS` (Line 9):** When set to `true`, the script automatically creates *MachineSets* for GPU nodes. Set to `false` if you do not need GPU support initially.
- **`GPU_NODE_COUNT` (Line 10):** Total number of GPU nodes to provision. The nodes are distributed across Availability Zones a, b, and c for resilience.
- **`AWS_GPU_INSTANCE` (Line 18):** Defaults to `g5.4xlarge`, which provides an NVIDIA A10G GPU per node. Adjust based on the workload requirements and available quota.

### Running the installation
Throughout the following steps, any value written in `<angle brackets>` is a placeholder and must be replaced with your actual value before running the command.

3. Log in to the OpenShift cluster:
```bash
oc login -u <user_name> <cluster_api_url>
```

4. Run the installation script:
```bash
./auto-install.sh
```

The script installs the required operators — including the *OpenShift AI Operator*, the *Node Feature Discovery Operator*, and the *NVIDIA GPU Operator* — and provisions GPU MachineSets if configured to do so. Depending on node provisioning times, the complete process takes 15 to 30 minutes.

### Verifying the installation

5. Confirm that the GPU worker nodes have joined the cluster:
```bash
oc get machineset -n openshift-machine-api
oc get machine -n openshift-machine-api
oc get nodes
```

6. Verify that the NVIDIA driver is loaded and that the GPU is accessible:
```bash
oc exec -it -n nvidia-gpu-operator \
  $(oc get pod -o wide -l openshift.driver-toolkit=true \
    -o jsonpath="{.items[0].metadata.name}" \
    -n nvidia-gpu-operator) \
  -- nvidia-smi
```

{{< figure src="/images/posts/post_21/nvidia_smi.png" title="nvidia-smi output confirming GPU access from within the NVIDIA GPU Operator pod" >}}

7. Check the *Argo CD* applications deployed as part of the GitOps installation:

{{< figure src="/images/posts/post_21/argo_cd.png" title="Argo CD application overview after the rhoai-gitops installation completes" >}}

All applications should be in a healthy and synced state before proceeding to configuration.

## Configuring OpenShift AI for GPU Workloads

With OpenShift AI installed, a small amount of configuration is needed to allow workbenches to schedule onto the GPU nodes. GPU nodes in OpenShift are typically tainted with `nvidia.com/gpu:NoSchedule` to prevent standard workloads from landing on them accidentally. Workbenches that need GPU access must be configured with a matching toleration.

### Verifying node taints

1. Check the taints applied to the GPU nodes:
```bash
oc get nodes
oc describe node <gpu_node_name>
```

The relevant taint will appear as `nvidia.com/gpu=:NoSchedule` in the node description.

### Creating a Hardware Profile

2. In the OpenShift AI console, navigate to **Settings → Hardware Profiles** and create a new profile (for example, `nvidia-gpu`).

3. Add a **Toleration** with the following values:

| Field | Value |
|---|---|
| Key | `nvidia.com/gpu` |
| Effect | `NoSchedule` |
| Operator | `Exists` |

{{< figure src="/images/posts/post_21/toleration.png" title="Configuring a toleration for the NVIDIA GPU taint in the Hardware Profile" >}}

This toleration allows workbenches assigned to this profile to be scheduled onto GPU nodes while keeping those nodes unavailable to other workloads.

### Creating a workbench with GPU access

4. Create a new workbench and select the `nvidia-gpu` hardware profile. The workbench pod will be scheduled on a GPU node.

5. Once the workbench is running, open a terminal and confirm GPU access:
```bash
nvidia-smi
```

{{< figure src="/images/posts/post_21/nvidia_smi_2.png" title="nvidia-smi output from inside an OpenShift AI workbench, confirming direct access to the NVIDIA A10G GPU" >}}

For a complete reference on hardware profiles and toleration configuration, the [Red Hat OpenShift AI documentation](https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/2.16/html/managing_openshift_ai/managing-hardware-profiles) covers the options in detail.

## Conclusion

The `rhoai-gitops` repository makes the Red Hat OpenShift AI installation genuinely straightforward: one script handles the operator stack, the GPU node provisioning, and the GitOps wiring. The manual steps that remain — creating the hardware profile and configuring the workbench — are minimal and need to be done only once per cluster.

The end result is an OpenShift AI environment with full GPU access, ready for running Jupyter notebooks, training jobs, or serving models. If you provisioned the underlying cluster using the approach described in [Deploying OpenShift on AWS with Automated Cluster Provisioning]({{< relref "post_20.md" >}}), the two repositories together cover the entire path from a blank AWS account to a working AI platform.

## References

- rhoai-gitops - GitHub repository by Álvaro López Medina - [link](https://github.com/alvarolop/rhoai-gitops)
- ocp-on-aws - GitHub repository by Álvaro López Medina - [link](https://github.com/alvarolop/ocp-on-aws)
- Red Hat OpenShift AI - Managing Hardware Profiles - [link](https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/2.16/html/managing_openshift_ai/managing-hardware-profiles)
- OpenShift AI - Product documentation - [link](https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed)
- OpenShift CLI (oc) - Getting started - [link](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started)
- NVIDIA GPU Operator documentation - [link](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html)
