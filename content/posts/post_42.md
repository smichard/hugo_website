---
title: "ORAS: Using a Container Registry as an Artifact Store"
date: 2026-08-10
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["CNCF","OCI","Registry","Tooling"]
thumbnail: "/images/posts/post_42/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_42/overview.png" title="Pushing non-image content into an OCI registry with ORAS - AI generated" >}}

## Introduction

For the last couple of months I have been working with agent frameworks in different places. Hermes Agent [on my own machine]({{< relref "post_28.md" >}}) first, then [on OpenShift]({{< relref "post_33.md" >}}) next to a self-hosted model endpoint. Whether one of these agents turns out to be useful comes down to three things: the model behind it, the tools it is allowed to call, and the context it can reach, meaning the data you give it to work with. The first two are configuration. The third one is a distribution problem, and that is the part I wanted to optimize and ideally automate.

Hermes has been running on my own hardware for a long time now, and that instance stays put. Everything else moves. For demos and experiments I spin agents up wherever they need to be, in a sandbox on my laptop one day and in a cloud environment such as OpenShift the next. All of them want the same pile of Markdown files as background knowledge. I want to hand that corpus over quickly, get the same files on the other side every time, and not think about it much. I experimented with an S3 bucket, which works, but it adds a second system with its own credentials, its own access rules and its own lifecycle, sitting next to a container registry that already stores content by digest. While researching alternatives I came across *ORAS*, a CNCF project that pushes ordinary files into an OCI-compliant registry. Not as a container image, as a plain artifact with its own media type. This post is a short introduction to it.

Reading up on it turned up something mildly embarrassing. ORAS was already in various places in my working life before I ever looked at the project. Red Hat Quay documents it as a first-class client. The Red Hat AI Inference Server reference deployment ships an ORAS init container that pulls model weights. OpenShift Dev Spaces uses it internally for workspace backups. So I had been using the project without noticing, which says something about how little it asks of you.

## What ORAS is ?

ORAS stands for OCI Registry As Storage. The premise is that a registry implements content-addressable storage with tags, digests, replication, and authentication, and there is no technical reason that content has to be a container image. Helm charts, software bills of materials, policy bundles, model weights, documentation archives: all of them are blobs with metadata, which is exactly what a registry stores.

The project has been a CNCF Sandbox project since 13 July 2021. Its first commit is from 24 December 2018, under Deis Labs, the Microsoft-acquired team that also produced Helm.

## Why put a directory in a registry

The alternative for my documentation corpus was an object storage bucket or a shared filesystem. A registry won for reasons that have nothing to do with containers.

Tags and digests give versioning and immutability without inventing a naming scheme. Access control, replication, and retention already exist and are already configured. Most importantly, the infrastructure is already there. Every organization I work with runs a registry, it is already integrated with their identity provider, and it is already reachable from their build systems and their clusters. That also turns the update path into a pipeline problem. The registry is already wired into the build systems, so refreshing the corpus is a CI job: regenerate the Markdown, push it under a new tag, and the agents pick it up the next time they pull. Collecting knowledge stops being something I remember to do by hand. Adding an artifact type to something that exists beats standing up something new.

## Distribution of the knowledge corpus

The core of ORAS is two commands. Authentication is the third one, and only once per machine: `oras login quay.io` writes to the same credential file podman and docker use, so on a host that is already logged in to the registry there is nothing to do.

The smallest useful thing is a single file:

```bash
oras push quay.io/namespace/document_store:hello hello.md:text/markdown
```

The argument after the reference is `<path>:<media-type>`. Point it at a directory instead and ORAS packs the whole tree into one layer: 

```bash
oras push quay.io/namespace/document_store:tag \
  --artifact-type application/vnd.example.docs.markdown.v1 \
  docs/:application/vnd.example.docs.markdown.layer.v1+tar
```

Pulling is one command on any machine that can reach the registry, and it writes the files back out:

```bash
oras pull quay.io/namespace/document_store:tag -o ./docs
```

Media types are the contract, and this is the part that takes a moment to internalize. There is no schema and no registration authority. You invent a string, and anything that consumes your artifact matches on it. If you omit `--artifact-type`, ORAS defaults to `application/vnd.unknown.config.v1+json`, which works and tells consumers nothing. Pick a real one.

## Conclusion

I adopted ORAS quickly, this time on purpose, after months of using it in three products without noticing. For my setup it does one job and does it well: it gets the same knowledge corpus to every agent I run, whether that is a sandbox on my laptop or a pod on OpenShift, with the registry credentials the machine already has. The next thing I want to try is pushing a fresh corpus from a pipeline on every change, so the agents pick up new context without me doing anything at all.


## References

- ORAS project homepage - [link](https://oras.land/)
- ORAS documentation - [link](https://oras.land/docs/)
- ORAS commands reference - [link](https://oras.land/docs/category/oras-commands/)
- ORAS on CNCF - [link](https://www.cncf.io/projects/oras/)
- oras-project/oras on GitHub - [link](https://github.com/oras-project/oras)