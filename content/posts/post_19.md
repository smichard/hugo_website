---
title: "My Local AI Stack: Open WebUI, LiteLLM, SearXNG, and Docling"
date: 2026-02-14
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Homelab"]
tags: ["homelab","AI","container","self-hosting"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_19/overview.png" title="Overview of the modular self-hosted AI stack - AI generated" >}}

## Introduction

In my previous post about my [homelab]({{< relref "post_18.md" >}}), I described the foundation I use for self-hosted services: a small set of low-power machines, Docker Compose for deployment, Traefik as the reverse proxy, and internal DNS to expose services with clean HTTPS hostnames. I have been running this setup for several years with very little maintenance overhead. That setup turned out to be a good base not only for classic self-hosting, but also for local AI workloads. Over the past year or so, I started extending it with tools to use and experiment with AI services.

Over time, I wanted more than a single chat UI connected to a single model provider. I wanted a setup that would let me experiment with different models, keep sensitive data inside my own network, enrich prompts with live web results, and work with local documents in a structured way. I also wanted to reuse the same operational patterns I already trusted in the rest of the homelab.

The result is a local AI stack built from four components:

- Open WebUI as the browser-based user interface
- LiteLLM as the OpenAI-compatible model gateway
- SearXNG as the privacy-friendly web search backend
- Docling as the document parsing layer for file-based workflows

Individually, each of these tools is useful. Combined, they form a practical self-hosted AI environment that fits neatly into the same Traefik-centered architecture as the rest of my homelab.

## Base platform and prerequisites

The AI stack runs on the same infrastructure described in the [previous post]({{< relref "post_18.md" >}}): refurbished thin clients running CentOS Stream 9, Docker and Docker Compose, Traefik as the reverse proxy, and internal DNS for clean HTTPS hostnames. The key design principle carries over as well: every externally reachable service joins the `external` Docker network and is exposed through Traefik using labels, giving a consistent way to publish services under HTTPS without managing ports or certificates per application.

My current setup is CPU-only. That matters. It is perfectly usable for orchestration, document processing, web-augmented prompting, and smaller local models, but it is not the right environment for large, latency-sensitive inference workloads. In practice, that constraint pushed me toward an architecture where the user interface, routing, tools, and document workflows run locally, while the model backend remains flexible enough to use either local or remote providers.

## Architecture overview

At a high level, the request flow looks like this:

1. A user opens Open WebUI in the browser.
2. Open WebUI sends model requests to LiteLLM through its OpenAI-compatible API.
3. LiteLLM routes the request to the selected backend model.
4. If a prompt requires live information, Open WebUI can use SearXNG as a search tool.
5. If a prompt requires document context, uploaded files are parsed with Docling and converted into markdown.
6. The model response is returned to Open WebUI and displayed to the user.

This separation of concerns is what makes the stack useful:

- Open WebUI handles the human interaction layer
- LiteLLM abstracts model backends and credentials
- SearXNG provides fresh web context
- Docling turns messy source documents into structured text

Traefik remains the single public entry point. From an operations perspective, that is valuable because the AI stack behaves like any other part of the homelab.

## Open WebUI as the central interface

Open WebUI is the part of the stack I interact with every day. It provides the browser-based interface for conversations, model selection, file uploads, and tool-assisted prompting. The important point is that Open WebUI does not need to know anything about individual model providers. It only needs a single OpenAI-compatible endpoint, which in this setup is LiteLLM.

That keeps the client configuration simple. If I want to add a new provider, swap one model for another, or change credentials, I do it behind the scenes in LiteLLM without having to reconfigure the user interface. Open WebUI also supports user and group management, making it straightforward to grant access to specific models or restrict certain users to a defined set of backends. A particularly useful feature is the ability to send a single prompt to multiple AI services simultaneously, which makes side-by-side model comparison a natural part of the workflow.

A simplified Docker Compose service definition for Open WebUI in this setup looks like this:

```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    environment:
      - OPENAI_API_BASE_URL=http://litellm:4000/v1
      - OPENAI_API_KEY=${LITELLM_MASTER_KEY}
    volumes:
      - ./data/open-webui:/app/backend/data
    networks:
      - external
      - internal
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=external"
      - "traefik.http.routers.openwebui.rule=Host(`ai.home.example.com`)"
      - "traefik.http.routers.openwebui.entrypoints=https"
      - "traefik.http.routers.openwebui.tls.certresolver=cloudflare"
      - "traefik.http.services.openwebui.loadbalancer.server.port=8080"
```

The exact image tag and environment variables may differ depending on the release and your setup, but the pattern stays the same: persistent storage for state, Traefik labels for routing, and a backend API endpoint that points to LiteLLM.

## LiteLLM as the model gateway

LiteLLM is the glue that makes the rest of the system flexible. It exposes a single OpenAI-style API while allowing multiple backends underneath. That means I can define logical model names and map them to either local inference backends or remote providers.

This is useful for several reasons:

- Open WebUI only has to speak one API
- I can standardize naming across models
- Provider credentials stay centralized
- Swapping backends becomes operationally cheap
- Logging and usage controls are easier to centralize

The Compose service definition for LiteLLM follows the same pattern:

```yaml
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: litellm
    restart: unless-stopped
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    environment:
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./litellm/config.yaml:/app/config.yaml:ro
    networks:
      - internal
      - external
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=external"
      - "traefik.http.routers.litellm.rule=Host(`litellm.home.example.com`)"
      - "traefik.http.routers.litellm.entrypoints=https"
      - "traefik.http.routers.litellm.tls.certresolver=cloudflare"
      - "traefik.http.services.litellm.loadbalancer.server.port=4000"
```

In a homelab context, this indirection is more valuable than it may seem at first. It lets the user interface stay stable while the model layer evolves. On CPU-only infrastructure, that matters because you will likely test several tradeoffs between speed, quality, hardware constraints, and cost.

{{< notice warning >}}
**Security note:**  
In March 2026, LiteLLM was subject to a suspected supply chain attack in which versions v1.82.7 and v1.82.8 on PyPI contained a malicious payload designed to harvest credentials and exfiltrate them to an external domain. Users running the official LiteLLM Docker image were not affected, as that deployment path pins dependencies and does not rely on the compromised PyPI packages. If you installed LiteLLM via `pip` during the affected window, treat any secrets on that system as compromised and rotate them immediately. See the official incident report for full details and verified safe versions.
{{< /notice >}}

## SearXNG for live, privacy-friendly search

One of the biggest limitations of a plain chat interface is the lack of current information. SearXNG solves that problem cleanly. It is a self-hosted metasearch engine that aggregates results from multiple sources and gives me a search API under my own control.

Even outside the AI stack, SearXNG is useful as a daily search engine. Inside the stack, it becomes more interesting because it can be exposed as a tool for prompts that need fresh information.

A minimal Compose service might look like this:

```yaml
services:
  searxng:
    image: docker.io/searxng/searxng:latest
    container_name: searxng
    restart: unless-stopped
    volumes:
      - ./searxng:/etc/searxng
    networks:
      - external
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=external"
      - "traefik.http.routers.searxng.rule=Host(`search.home.example.com`)"
      - "traefik.http.routers.searxng.entrypoints=https"
      - "traefik.http.routers.searxng.tls.certresolver=cloudflare"
      - "traefik.http.services.searxng.loadbalancer.server.port=8080"
```

Once connected to Open WebUI as a tool, the flow is straightforward:

1. The user asks a question that requires current information.
2. The model decides to call the search tool.
3. SearXNG performs the search.
4. Titles, snippets, and URLs are returned as context.
5. The model synthesizes an answer grounded in current results.

This gives me something I find genuinely useful in practice: a private interface for AI-assisted research that is not trapped behind a vendor-specific search integration.

## Docling for document parsing

The fourth component, Docling, addresses a different problem. Large language models work best with clean text, but many real documents are messy. PDFs, slide decks, and office files often contain broken text flows, layout artifacts, or table structures that are not useful when passed to a model as-is.

Docling converts these documents into a markdown representation that is much easier to use as model context. That sounds small, but it is a major quality improvement for local document workflows.

The Docling service definition is straightforward:

```yaml
services:
  docling:
    image: quay.io/docling-project/docling-serve:latest
    container_name: docling
    restart: unless-stopped
    networks:
      - internal
      - external
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=external"
      - "traefik.http.routers.docling.rule=Host(`docling.home.example.com`)"
      - "traefik.http.routers.docling.entrypoints=https"
      - "traefik.http.routers.docling.tls.certresolver=cloudflare"
      - "traefik.http.services.docling.loadbalancer.server.port=5001"
```

The typical usage pattern is:

1. Upload a document in Open WebUI.
2. Docling parses the file and converts it to markdown.
3. Feed that markdown into the model as structured prompt context.
4. Ask targeted questions against the extracted content.

This is especially useful for technical notes, whitepapers, internal PDFs, or vendor documentation where the raw file format is not suitable for direct prompting.

## Conclusion

This stack did not start as an attempt to build a local alternative to a commercial AI product. It emerged naturally from an existing homelab that already had strong building blocks: containerized services, Traefik, DNS-based routing, and a bias toward self-hosting.

Adding Open WebUI, LiteLLM, SearXNG, and Docling turned that base into a practical local AI environment. It gives me a single interface for model interaction, the ability to swap backends without changing clients, a way to enrich prompts with live web data, and a better workflow for document-driven tasks.

Just as important, it stays operationally consistent with the rest of the homelab. That keeps the setup understandable, maintainable, and worth using day to day.

Future extensions are obvious: adding a vector database, introducing GPU-backed local inference, wiring the stack into event-driven automations with n8n, routing requests to model endpoints running on specialized inference platforms, or using Open WebUI as a gateway to interact with AI agents. But even without those additions, this combination already covers a large share of the AI workflows I actually care about.

## References
- My Homelab: A Traefik-centered Self-hosting Setup - [link]({{< relref "post_18.md" >}})
- Open WebUI - project site - [link](https://openwebui.com/)
- Open WebUI - GitHub - [link](https://github.com/open-webui/open-webui)
- LiteLLM - project site - [link](https://www.litellm.ai/)
- LiteLLM - GitHub - [link](https://github.com/BerriAI/litellm)
- LiteLLM - Security incident report, March 2026 - [link](https://docs.litellm.ai/blog/security-update-march-2026)
- SearXNG - documentation - [link](https://docs.searxng.org/)
- SearXNG - GitHub - [link](https://github.com/searxng/searxng)
- Docling - documentation - [link](https://docling-project.github.io/docling/)
- Docling - GitHub - [link](https://github.com/docling-project/docling)
