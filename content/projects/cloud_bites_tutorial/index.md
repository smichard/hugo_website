---
title: "Cloud Bites Tutorial"
date: 2022-11-02T20:34:39Z
draft: false
summary: "A hands-on tutorial that goes from a container on your laptop to Kubernetes clusters on Google Cloud."
github: "https://github.com/smichard/cloud_bites_tutorial"
weight: 4
---

**Cloud Bites** is a hands-on tutorial I wrote in 2022, while working at Dell Technologies, to teach the basics of deploying an application in a cloud-native environment. The goal was to educate a community of solutions architects across EMEA about cloud-native technologies, particularly Kubernetes. The chapters build on one another, starting with a container running on your local machine and ending with Kubernetes clusters on Google Cloud. A small website serves as the sample application throughout, and its source code is included in the repository.

Along the way it sets up a reproducible development environment with Vagrant and VirtualBox, builds and runs Docker containers, stands up a local cluster with K3D, works through the everyday kubectl operations for pods and deployments, provisions a cluster on Google Cloud three different ways (the CLI, the Cloud Console, and Terraform), and inspects the running workloads with VMware Octant. It makes no claim to completeness. It is meant as a fast, practical on-ramp for people who learn by doing.

I led several hands-on workshops and curated an online course based on this tutorial. The accompanying blog post provides a chapter-by-chapter walkthrough, and the presentation slides are available below.

{{< download file="/documents/Cloud_Bites_Slides.pdf" title="Download the slides" >}}

## References
- Blog Post - [link]({{< ref "/posts/post_6.md" >}})
- GitHub Repository - [link](https://github.com/smichard/cloud_bites_tutorial)
