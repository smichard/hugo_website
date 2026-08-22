---
title: "Running the Red Hat Offline Knowledge Portal"
date: 2026-08-10
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Homelab"]
tags: ["Red Hat","Documentation","homelab","container"]
thumbnail: "/images/posts/post_43/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_43/overview.png" title="One container, 170,000+ local resources: why an offline documentation snapshot is useful, what is inside it, and what it takes to run - AI generated" >}}

## Introduction

In this post I want to describe the *Red Hat Offline Knowledge Portal* (RHOKP), what it actually contains, and how I run it as a permanent service in my homelab. Red Hat product documentation and the Knowledgebase are good, but they live on the internet behind a login. RHOKP takes a snapshot of that content and packages it as a single container image you run yourself.

The product is positioned for air-gapped environments: secure facilities, closed-circuit networks on ships, military units with intermittent connectivity, remote research outposts. Those cases are real, and they are also not why I run it. My homelab has internet access. I run it because a local instance answers in milliseconds, and can be pointed at by tooling that has no business holding my Customer Portal credentials.

## What is in the image

RHOKP is one container based on *ubi9/httpd-24* with an *Apache Solr* 9.8 index inside. There is no database to attach, no operator, no second component. According to the release notes it carries more than 10,000 product documents and over 160,000 Knowledgebase articles and solutions. Alongside those you get the Red Hat CVE database, the product errata database, product life cycle pages, the Security Data API in machine-readable JSON, and a selection of Customer Portal pages.

The instance I run reports version 1.2.10 with content extracted on 2026-08-12, and the product index reads like the Red Hat catalog. OpenShift Container Platform, RHEL, Ansible Automation Platform, OpenShift AI and the rest of the AI portfolio. Everything I look up in a normal week is in there, which is the only benchmark I care about.

What makes it usable is less obvious than the content count. Links keep working inside the local copy, and the URL paths are the same ones the Customer Portal uses, so only the host differs. Swap the host and you are on the live page. 

## Where it helps

The obvious case is having no connection at all. Below that there is a set of situations where a local copy is the better option even with connectivity:

- Customer sites where the guest wifi is slow, or where laptops are not allowed to reach the internet at all.
- Trains and planes.
- Search that returns product documentation and Knowledgebase content in one query, without the Customer Portal login timing out mid-session.
- Local tooling and AI agents that need to read documentation. Pointing an agent at a local HTTP endpoint is a different security conversation than handing it portal credentials.

The limitation is honest and worth stating up front: RHOKP is a snapshot. New images ship on a regular basis, but Red Hat makes no promises about when. If you need today's errata, you need the internet.

## Prerequisites

RHOKP requires an active Red Hat Satellite subscription. The documentation says it is included with Satellite at no additional cost, and you do not need Satellite installed or running to use RHOKP. 

Beyond that you need a container runtime, and credentials for `registry.redhat.io` from your Customer Portal, Red Hat Developer, or a registry service account. Red Hat documents 1 core, 1 GB RAM, and 50 GB disk as the minimum, and 2 cores, 2 GB, and 75 GB as the recommendation. Plan for the disk. The image is around 12 GB, and every weekly refresh pulls another one.

The content is licensed and internal-use only. The EULA is explicit that you do not share the image, its content, or your access key.

## Running it on a single machine

The quickest way to see it is a local run with Podman. Log in and pull:

```bash
podman login registry.redhat.io
podman pull registry.redhat.io/offline-knowledge-portal/rhokp-rhel9:latest
```

Generate a personal access key at the [Access Key Generator](https://access.redhat.com/offline/access/) page. The key is stored in your Red Hat account, so you can display it again later. Then start the container:

```bash
podman run --rm -p 8080:8080 -p 8443:8443 \
  --env "ACCESS_KEY=<your_personal_access_key>" \
  -d registry.redhat.io/offline-knowledge-portal/rhokp-rhel9:latest
```

Give it about 30 seconds, then open `http://localhost:8080` or `https://localhost:8443` and accept the self-signed certificate Podman generates.

The access key is what unlocks the full experience: search across the whole snapshot, plus the Solutions and Articles tiles. Without one the container still starts and the product documentation is there to browse, along with the CVE and errata pages if you follow a link or know the path, so you can have a look before sorting out a key. Search is the reason to run it though, so sort one out.

A few environment variables are worth knowing:

| Variable | Effect |
|---|---|
| `ACCESS_KEY` | Unlocks encrypted content and search |
| `ONLINE_VIEW` | Adds a button linking to the online version of the current page |
| `SOLR_MEM` | Solr JVM heap, minimum and maximum. Default `1g` |
| `UNCLASSIFIED_BANNER` | Green UNCLASSIFIED banner, for government environments |

I set `ONLINE_VIEW=true` because my instance has internet access and jumping to the live page is occasionally useful. I also raise `SOLR_MEM` to `2g`, which makes search on the full index noticeably less sluggish on my hardware.

## Running it as a homelab service

The single-machine recipe is fine for a laptop. For the homelab I want it on a hostname, over HTTPS, reachable from every device on my network, and running without me thinking about it. That fits the pattern I described in my [homelab post]({{< relref "post_18.md" >}}):

```yaml
services:
  rhokp:
    image: registry.redhat.io/offline-knowledge-portal/rhokp-rhel9:latest
    container_name: rhokp
    restart: unless-stopped
    networks:
      - external
    environment:
      - ACCESS_KEY=${RHOKP_ACCESS_KEY}
      - ONLINE_VIEW=true
      - SOLR_MEM=2g
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rhokp.entrypoints=https"
      - "traefik.http.routers.rhokp.rule=Host(`rhokp.home.example.com`)"
      - "traefik.http.routers.rhokp.tls.certresolver=cloudflare"
      - "traefik.http.services.rhokp.loadbalancer.server.port=8080"

networks:
  external:
    external: true
```

No ports are published to the host. Traefik reaches the container on the `external` network and is the only way in. The access key lives in a `.env` file next to the compose file, following the same convention as the rest of my services.

RHOKP has no update mechanism. Every release is a new image, tagged with the release version and the build date, and updating means pulling the new image and recreating the container. I have a service running on the host that watches the registry and does this for me, so a new snapshot lands as soon as Red Hat publishes one and I never think about it. 

## Conclusion

Having the Red Hat documentation on my own network has turned out to be one of the more useful things running in the homelab. It sits in my mafl dashboard next to everything else, so it is one click away, and a search comes back immediately with no login redirect and no round trip to the internet in between. For something I hit several times a day, that adds up.

What makes it more than a convenience is what sits on top. A documentation source on my own network can be read by local tooling and AI agents without handing them my portal credentials.

## References

- RHOKP - product page - [link](https://access.redhat.com/products/red-hat-offline-knowledge-portal/)
- RHOKP - documentation - [link](https://docs.redhat.com/en/documentation/red_hat_offline_knowledge_portal/1)
- Developers Blog: How to install Offline Knowledge Portal on a local system, by Avnish Kumar - [link](https://developers.redhat.com/articles/2025/08/13/how-install-offline-knowledge-portal-local-system)
- RHOKP - announcement - [link](https://www.redhat.com/en/blog/innovation-anywhere-red-hat-delivers-critical-expertise-offline-knowledge-portal)
- Access Key Generator - [link](https://access.redhat.com/offline/access/)