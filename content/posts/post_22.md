---
title: "Mirroring Red Hat Documentation Locally with rh-mastery"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["Red Hat","Documentation","Tooling"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_22/overview.png" title="Workflow diagram of rh-mastery process - AI generated" >}}

# Introduction

In this post, I want to describe a tool built by my colleague **Francisco J. Lopez Grüber** that solves a problem most people quietly live with: Red Hat product documentation is comprehensive and well-maintained, but it lives on the internet. Accessing it requires a browser, a connection, and knowing where to look. For offline environments, air-gapped labs, or anything beyond casual browsing, that dependency quickly becomes friction.

*rh-mastery* addresses this directly. It mirrors *Red Hat* product documentation from [docs.redhat.com](https://docs.redhat.com) as PDF files into a local directory tree, and optionally can convert those PDFs to Markdown. The Markdown output is where things get particularly interesting: combined with tools like [qmd](https://github.com/tobi/qmd) from Shopify CEO [Tobias Lütke](https://github.com/tobi), the converted documentation becomes a local knowledge base that AI agents can query directly — no internet access required, no context switching, and no copy-pasting from browser tabs. For anyone building AI-assisted developer workflows, having structured access to accurate, version-tracked product documentation on the local machine is a meaningful step up.

The tool is available on GitHub at [flg-redhat/rh_mastery](https://github.com/flg-redhat/rh_mastery).

## What rh-mastery Does

At its core, rh-mastery handles two tasks:

- **Sync:** For a given product alias or slug, it probes docs.redhat.com, resolves the current documentation version, and downloads all available PDFs into a structured local directory tree: `{download_base}/{slug}/{version}/`.
- **Convert:** Once PDFs are present, the `convert` command transforms them into Markdown files using *PyMuPDF4LLM* (default) or *Docling* as an optional heavier-weight alternative. Each Markdown file includes a short YAML front matter block with provenance metadata — title, source, version, and conversion timestamp.

Individual products can be targeted using short aliases such as `--ocp` or `--ansible`, or by passing the full Red Hat documentation slug directly. To download the complete documentation for all tracked products at once, `rh-mastery sync --all` handles that in a single invocation.

The recommended way to run rh-mastery is via its container image, which keeps dependencies isolated and makes the workflow reproducible.

## Setting Up the Environment

The image is built from *Red Hat Universal Base Image 10 Init* and includes systemd, allowing for optional scheduled syncs via timers or cron inside the container. Build it from the repository root:

```bash
git clone https://github.com/flg-redhat/rh_mastery
cd rh_mastery
podman build -f Containerfile -t rh-mastery:latest .
```

Create a local `data/` directory to hold the downloaded files. This directory will be mounted into the container, so its contents persist across container restarts and recreations.

```bash
mkdir -p data
```

## The Workflow

The end-to-end workflow from a fresh image to a set of Markdown files ready for distribution follows five steps.

### 1. Start the container

```bash
podman run -d --name rh-mastery \
  --systemd=always --rm \
  -v ./data:/var/lib/rh-mastery:Z \
  rh-mastery:latest
```

This starts the container in detached mode and mounts the local `data/` directory into `/var/lib/rh-mastery` inside the container. All downloads and converted files will appear under `data/` on the host.

### 2. Open an interactive shell

```bash
podman exec -it rh-mastery bash
```

### 3. Sync the documentation

```bash
rh-mastery sync --all
```

This downloads the current documentation for all tracked products into the mounted volume. Individual products can be synced using their alias, for example `rh-mastery sync --ocp` or `rh-mastery sync --ansible`. Run `rh-mastery --help` inside the container to see the full alias table.

### 4. Convert PDFs to Markdown

```bash
rh-mastery convert --all
```

This converts every synced PDF into a Markdown file alongside it. Both the original PDFs and the converted Markdown files are present after this step. The conversion uses PyMuPDF4LLM by default, which handles most layouts well. For documents with complex tables or multi-column layouts, the `--engine docling` option is available but requires installing additional dependencies.

### 5. Exit the container and clean up PDFs (optional step)

Once conversion is complete, exit the container shell. Depending on the use case, the original PDF files may no longer be needed, if Markdown is the target format, removing the PDFs reduces the total size of the data directory significantly:

```bash
exit
find ./data/RHDocumentation -name "*.pdf" -delete
```

The Markdown files in `data/RHDocumentation` are now ready for local use, distribution, or ingestion by an AI agent.


## From Markdown to AI Agent Knowledge

The Markdown output from rh-mastery is structured and annotated, which makes it well-suited for ingestion by AI agents and local language model tooling. Each file carries front matter metadata that allows agents to identify the product, version, and source, and the content retains the section hierarchy of the original documentation.

[qmd](https://github.com/tobi/qmd), built by Tobias Lütke, is a lightweight tool for querying local Markdown files. Pointed at the directory tree produced by rh-mastery, it gives AI agents fast, accurate access to the full Red Hat documentation corpus — entirely offline and without relying on external APIs or web retrieval. The combination is particularly effective in environments where internet access is restricted, or when a development workflow benefits from a self-contained, version-locked knowledge source.

# Conclusion

rh-mastery turns what would otherwise be an ongoing manual effort into a single repeatable command. The container image keeps the setup clean, and the Markdown output opens up practical AI-assisted use cases that go beyond what a standard documentation browser can offer. Francisco's tool fills a gap that is easy to overlook until you actually need it.

# References

- rh-mastery - GitHub repository by Francisco J. Lopez Grüber - [link](https://github.com/flg-redhat/rh_mastery)
- qmd - GitHub repository by Tobias Lütke - [link](https://github.com/tobi/qmd)
- Red Hat product documentation - [link](https://docs.redhat.com)