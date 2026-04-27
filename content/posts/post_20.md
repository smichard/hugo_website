---
title: "Deploying OpenShift on AWS with Automated Cluster Provisioning"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["OpenShift"]
tags: ["openshift","aws","automation","gitops","rhoai"]
toc:
  enable: false
---

## Introduction

In this post, I want to describe how to deploy **Red Hat OpenShift** in a blank Amazon Web Services (AWS) environment using a fully automated and repeatable approach. This post is part of a series of two posts: 1. This post covers the cluster provisioning step. 2. The installation of OpenShift AI on top of the running OpenShift cluster is covered in a separate post: [Install OpenShift AI on OpenShift]({{< relref "post_21.md" >}}). If you already have an OpenShift cluster available, feel free to jump straight to that post.
Both workflows build on two GitHub repositories that cover both infrastructure provisioning and the installation of the AI platform components, and they reduce what could easily be a multi-hour manual effort to a handful of shell commands.

I should be upfront: one purpose of this post is also to serve as a personal reference for future me, who will inevitably return here after six months asking "wait, what was the exact command again?" Consider this the written documentation I should have filed away the first time.

A special thanks goes to my colleague [**Álvaro López Medina**](https://github.com/alvarolop), who created and maintains the [ocp-on-aws](https://github.com/alvarolop/ocp-on-aws) and [rhoai-gitops](https://github.com/alvarolop/rhoai-gitops) repositories. Without his work and support, setting up this environment would have been significantly more involved.

## Prerequisites

Before starting, a Linux workstation or jump host is recommended for running the commands. The following command line tools must be installed and configured:

- [**OpenShift CLI (oc)**](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started) – required to interact with the OpenShift cluster
- [**AWS CLI**](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) – required to provision and manage AWS infrastructure
- **htpasswd** – required to generate user credentials for the cluster

These are fundamental prerequisites. The installation scripts will fail or behave unexpectedly without them.

## Ordering an AWS Blank Environment

For Red Hat employees and Red Hat partners, the easiest starting point is an [AWS Blank Open Environment](https://catalog.demo.redhat.com/catalog?item=babylon-catalog-prod/sandboxes-gpte.sandbox-open.prod&utm_source=webapp&utm_medium=share-link) from the [Red Hat Demo Platform (RHDP)](https://catalog.demo.redhat.com/catalog). Otherwise, an existing AWS account accessed through the [AWS Web Console](https://aws.amazon.com/) works just as well.

This tutorial was validated against eu-west-1. The blank environment provides a clean, ephemeral AWS account with the necessary IAM permissions and service quotas to support an *Installer-Provisioned Infrastructure (IPI)* deployment of OpenShift.
 
Once the environment is provisioned, the service overview page contains the AWS access credentials and the base DNS zone that will be needed in the configuration step below.

## Deploying OpenShift on AWS

With the AWS environment in place, the [ocp-on-aws](https://github.com/alvarolop/ocp-on-aws) repository handles the rest of the cluster provisioning. The repository wraps the OpenShift IPI installer in a shell script and manages user creation, cluster-admin group configuration, and the pull secret in a structured, repeatable way.

## Preparing the repository

Throughout the following steps, any value written in `<angle brackets>` is a placeholder and must be replaced with your actual value before running the command.

1. Clone the repository:
```bash
git clone https://github.com/alvarolop/ocp-on-aws
cd ocp-on-aws
```

2. Copy the authentication file templates:
```bash
cp auth/users.htpasswd.example auth/users.htpasswd
cp auth/group-cluster-admins.yaml.example auth/group-cluster-admins.yaml
```

3. Generate a password hash for your user:
```bash
htpasswd -b -B auth/users.htpasswd <user_name> <password>
```

4. Adjust `auth/group-cluster-admins.yaml` to list the users that should receive `cluster-admin` privileges:
```yaml
apiVersion: user.openshift.io/v1
kind: Group
metadata:
  name: cluster-admins
users:
  - redhat
  - <user_name>
```

## Configuring the installation

5. Copy the configuration template:
```bash
cp aws-ocp4-config aws-ocp4-config-labs
```

6. Open the configuration file and adjust the following parameters:
```bash
vi aws-ocp4-config-labs
```

The key values to review:

- **`OPENSHIFT_VERSION` (Line 6):** Set this to match your local `oc` client version for maximum compatibility.
- **`RHPDS_TOP_LEVEL_ROUTE53_DOMAIN` (Line 9):** The base DNS zone for your cluster; find this in the RHDP service overview.
- **`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (Lines 16–18):** The programmatic access credentials from the RHDP environment, required to create the VPC and EC2 instances.
- **`RHOCM_PULL_SECRET` (Line 31):** Retrieve this from the [Hybrid Cloud Console](https://console.redhat.com/openshift/install/pull-secret).
- **`WORKER_REPLICAS` (Line 47):** Set to the number of worker nodes required for your workload.

## Running the installation

7. Start the cluster installation:
```bash
./aws-ocp4-install.sh aws-ocp4-config-labs
```

The script invokes the OpenShift IPI installer and creates all required AWS infrastructure: VPC, subnets, EC2 instances, Elastic Load Balancers, and Route53 DNS records. The process typically takes 30 to 45 minutes. It is worth monitoring the AWS console in the corresponding region during this time to observe the resources coming up.

{{< figure src="/images/posts/post_20/aws_console.png" title="EC2 instances and load balancers provisioned in AWS after the installation completes" >}}

Once the installer finishes, the cluster API and console URLs, along with the `kubeconfig` file, will be available in the output and in the `auth/` directory of the repository.

{{< figure src="/images/posts/post_20/argo_cd.png" title="Argo CD applications deployed as part of the cluster bootstrap" >}}

The installation script also bootstraps a set of *Argo CD* applications that manage cluster-level configurations through GitOps from the start. This gives the cluster a solid, declarative baseline before any additional workloads are installed.

## Conclusion

The combination of the AWS blank environment and the `ocp-on-aws` repository makes it straightforward to spin up a fully functional OpenShift cluster in under an hour with minimal manual intervention. The IPI installer handles the infrastructure details, and the GitOps bootstrap ensures a consistent cluster configuration from the first login.

With the cluster in place, the next step is installing OpenShift AI and enabling GPU support, which is covered in the follow-up post: [Install OpenShift AI on OpenShift]({{< relref "post_21.md" >}}).

## References

- ocp-on-aws - GitHub repository by Álvaro López Medina - [link](https://github.com/alvarolop/ocp-on-aws)
- rhoai-gitops - GitHub repository by Álvaro López Medina - [link](https://github.com/alvarolop/rhoai-gitops)
- Red Hat Demo Platform - [link](https://catalog.demo.redhat.com/catalog)
- OpenShift CLI - Getting started - [link](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/cli_tools/openshift-cli-oc#cli-getting-started)
- AWS CLI - Installation guide - [link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Red Hat Hybrid Cloud Console - Pull Secret - [link](https://console.redhat.com/openshift/install/pull-secret)
