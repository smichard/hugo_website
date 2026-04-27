---
title: "qmd: Semantic search accross markdown notes"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["markdown", "ai", "workflow"]
toc:
  enable: false
---

## Introduction

I have been using Obsidian for several years. What started as a place for personal notes gradually grew into something larger: bookmarks saved as markdown files, project notes, research output, and increasingly, a knowledge base maintained and organized by AI agents following Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) concept. The idea formulated by Karpathy is to build a personal Wiki, curated, agent-maintained collection of structured markdown notes. Once that kind of setup grows past a few hundred files, finding something quickly matters more than it used to.

Recently I came across [*qmd*](https://github.com/tobi/qmd) (abbrev. for Query Markup Documents), a local CLI search engine for markdown documents written by [Tobias Lütke](https://github.com/tobi), CEO of Shopify.

## What qmd Is

qmd indexes a folder of markdown files and lets you query them from the command line. It runs entirely locally with no cloud dependencies. 

Under the hood, qmd combines three retrieval strategies. It runs BM25 keyword search via SQLite, vector semantic search using a local embedding model, and LLM-based re-ranking to score results before returning them. For most queries, the `query` command runs the full pipeline. There is also a `search` command for plain keyword lookup and a `vsearch` command for semantic-only search.

## Setup

Getting started requires Node.js 22 or higher. Install the package, point qmd at a folder, run the embedding pass, and start querying:

```bash
npm install -g @tobilu/qmd
qmd collection add ~/<directory> --name <collection_name>
qmd embed
qmd query "<search_term>"
```

The initial `qmd embed` pass indexes the collection and downloads the local models, which adds up to around 1.7GB on disk. After that, incremental updates are fast and queries run offline.

## MCP Integration

qmd also ships with an MCP server, which means it can be connected directly to large language models as a search tool. Once configured, an AI agent can query your vault mid-session without you having to manually locate or read files. The tool supports a `--json` output flag designed for exactly this kind of agentic use: structured output that an agent can parse and act on without screen scraping.

For a vault where AI agents are already contributing content, being able to point those same agents back at the vault as a searchable knowledge source is a natural complement.

## Conclusion

qmd fills a gap that grows more noticeable as a markdown vault gets larger. Obsidian's built-in search works well for simple lookups, but semantic search across a large, mixed-content vault is a different problem. qmd handles that locally, without sending anything to an external service, and integrates cleanly with AI agent tooling through MCP. For anyone running a Karpathy-style personal knowledge base in Obsidian, it is worth adding to the stack.

## References

- qmd on GitHub - [link](https://github.com/tobi/qmd
- Tobias Lütke on GitHub - [link](https://github.com/tobi)
- Andrej Karpathy on the LLM Wiki concept - [link](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
