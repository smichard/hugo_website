---
title: "Task Management with Tududi"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["homelab", "self-hosting", "productivity", "container", "ai"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_29/overview.png" title="Workflow diagram of rh-mastery process - AI generated" >}}

## Introduction

Over the years I have tried quite a few task management tools. The pattern was always the same: use it for a while, run into some friction, look for an alternative, migrate, repeat. Most tools handle data export reasonably well, so switching was rarely a hard technical problem. It was more the disruption of it, rebuilding a setup that had taken months to settle into.

What I was really looking for was a self-hosted tool. Something I control, that runs on my own infrastructure, and does not depend on a third-party service staying around or staying affordable. After some research I came across *[Tududi](https://github.com/chrisvel/tududi)*, an open-source task and life management application written by [Chris Veleris](https://github.com/chrisvel).

## What Tududi Is

Tududi follows a [Getting Things Done](https://en.wikipedia.org/wiki/Getting_Things_Done) style hierarchy: areas contain projects, projects contain tasks. Tasks can have subtasks, recurrence rules, tags, and notes. The interface is clean and focused on individual use, not team collaboration.

The tech stack is React on the frontend, Node.js on the backend, and SQLite as the database. That last point matters for a homelab: the entire database is a single file, which makes backups trivial. Deployment is a single container, and configuration is handled through environment variables.

Tududi reached v1.0.0 in March 2026, which marks the end of the beta phase. The project has around 2.6k stars on GitHub and is actively developed. There is also a hosted option at *[cloud.tududi.com](https://cloud.tududi.com/)* for anyone who does not want to run it themselves.

## How It Fits Into the Homelab

Running Tududi in my [homelab]({{< relref "post_18.md" >}}) was straightforward. It runs as a Docker container behind Traefik, accessible over a clean subdomain via SSL. From there I can reach it from any device on the network or when connected via VPN.

Two integrations make Tududi more useful beyond the browser. The Telegram bot lets me add tasks from my phone without opening a browser. The tool also supports CalDAV, which means tasks with due dates can be synced directly to any calendar client that speaks the protocol, a useful option if you want your tasks and calendar in one view.

## Deployment

Tududi is straightforward to deploy. The following is the minimal setup to get it running locally:

```bash
docker pull chrisvel/tududi:latest

docker run \
  -e TUDUDI_USER_EMAIL=you@example.com \
  -e TUDUDI_USER_PASSWORD=yourpassword \
  -e TUDUDI_SESSION_SECRET=$(openssl rand -hex 64) \
  -v ~/tududi_db:/app/db \
  -p 3002:3002 \
  -d chrisvel/tududi:latest
```

The application is then available at `http://localhost:3002`. The database is a single SQLite file persisted in the mounted volume, so backups are as simple as copying that file. For a homelab setup, the natural next step is to move to a Compose file, store the environment variables in a separate `.env` file, and place the container behind a reverse proxy like Traefik to expose it via a clean subdomain over SSL.

## Connecting Tududi to Hermes AI

The more interesting part came when I gave my *[Hermes AI](({{< relref "post_28.md" >}}))* agent access to Tududi through its REST API. This enabled two things: a daily digest of open tasks delivered each morning, and a weekly retrospective summarizing what was completed during the week. Both run automatically without me having to do anything.

Connecting Hermes to Tududi also helped with migration. I had a number of long-running tasks sitting in my previous tool that I wanted to carry over without losing context. Having an AI agent handle the transfer meant the migration was smooth and nothing got dropped.

## Community

Chris is actively developing the project and there is a [Discord](https://discord.gg/fkbeJ9CmcH) community where users can suggest features and give feedback. I have found it a good place to see what others are building on top of the tool and to follow where the project is headed.

## Conclusion

For me, Tududi is the tool that fits my way of working best. It is lightweight, self-hosted, and stays out of the way. At the same time it is feature-rich enough to cover real workflows: recurring tasks, subtasks, CalDAV sync, Telegram integration, and a REST API that makes it easy to connect to other services. I use the API to integrate it with AI agents, but the same approach would work with tools like n8n or any other automation layer. If you are looking for a personal task manager you can run yourself, it is worth a look.

## References

- Tududi on GitHub - [link](https://github.com/chrisvel/tududi)
- Tududi Documentation - [link](https://docs.tududi.com/)
- Tududi Hosted - [link](https://cloud.tududi.com/)
- Tududi Discord Community - [link](https://discord.gg/fkbeJ9CmcH)
- Personal Website of Chris Veleris - [link](https://chrisveleris.com/)
- Definition of the Getting Things Done Framework on Wikipedia - [link](https://en.wikipedia.org/wiki/Getting_Things_Done)