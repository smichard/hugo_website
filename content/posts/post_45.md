---
title: "Hermes Bot Mode: Persistent Specialist Profiles"
date: 2026-10-11
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["homelab", "hermes", "ai", "agents","self-hosting"]
thumbnail: "/images/posts/post_45/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_45/overview.png" title="Hermes Bot Mode: Every Profile Becomes a Named Bot with Its Own Chat, Role, Model, and Skills - AI generated" >}}

# Introduction

I have been running [Hermes Agent](https://github.com/NousResearch/hermes-agent) as my personal AI assistant for several months ([previous post]({{< relref "post_28.md" >}})), and my setup has grown separate profiles for different kinds of work. Each profile keeps its own memory and history. Coordination between the profiles, though, happened outside the tool.

Hermes Agent v0.21.0, released on 31 August 2026, gives that model a different interface. Bot Mode turns each profile into a named bot with its own chat, role, model, and skills. Bots appear in a roster in Hermes Desktop, they can message each other, and routines attach to the bot responsible for them. The headline is a roster and group-chat interface, the part that interests me is how I can use bot mode in my daily setup.

I have been running Bot Mode for a couple of weeks now, and this post shares what I have learned from the new setup so far.

# A Bot Is Still a Profile

Bot Mode deliberately reuses the profile primitive. A bot is an existing Hermes profile: configuration, memory, skills, and history live under `~/.hermes/profiles/<name>/`. The desktop application adds the roster, the visual identity, and the messaging layer. There is no new object type to learn and nothing to convert.

That keeps the operational model intact. `hermes -p <bot> chat` opens the same agent from the command line, and a bot's routines appear in `hermes cron list` as `[bot:<name>]` jobs. What you configure in the roster is visible from the terminal, which matters for anyone who manages agents from a shell.

Isolation needs a qualification here. Profiles separate Hermes state: memory, skills, conversation history, and configuration. They do not sandbox the filesystem. With the local terminal backend, a bot runs with the operating-system user's access, and new bots share the main profile's credential pool by default. A narrow `SOUL.md` and a restricted toolset are configured boundaries, not enforced ones.

Within those limits, separation still helps. A research bot can be configured with web and document access, a writing bot with a narrower toolset and a constrained prompt. Before Bot Mode, I set that up by juggling profiles by hand. Now it is easy to create persistent bots for specific tasks, and a small team of narrow bots is far easier to reason about than one broad agent with every capability enabled.

# My Bot Team

Next to my main agent, I now run three specialists: a research bot, a critic, and an ops bot. Each has its own Hermes profile and its own Matrix account, so each one shows up as a separate contact I can message directly.

The research bot does thorough research across various sources and compiles the results into a research document, sources included. It searches the web, but it starts with my knowledge base, so a new note builds on what I have already collected. The critic reviews whatever I put in front of it: a blog draft, an architecture idea, a migration plan. Its instructions ask for feedback that is constructive and still uncomfortable, and it takes that second part seriously.

The ops bot helps me run my IT infrastructure. It has read-only access to my environment, which sounds limiting, but so far I have not been comfortable enough to give it write access. It is still helpful. When a service fails, for example, it checks whether the service is reachable, works out when it became unavailable, reads the logs, and hands me a remediation plan. I still apply the fix myself. For most problems I face in my environment, the tricky part is diagnosis and triage; applying the fix is often the easiest and shortest step. That is where the ops bot helps a lot.

# Why Separate Bots Work Better

Before this setup, one agent did everything, and switching tasks was where it went wrong. Moving from a failing container to a specific research question in the same conversation meant leftover details from the first task drifting into the second, and I spent time re-explaining context. Now each bot keeps its own conversations, memory, skills, and credentials. The ops bot remembers last week's incident. The critic knows nothing about it and does not need to.

Specialisation also accumulates. Each bot carries its own instructions, tools, and skills, so the critic's review checklist or the ops bot's log routine is written once and reused on every request. Each bot can also run on a different model, chosen for its job, so reading a log file does not have to go through the same model as a long research synthesis.

The bots work together too. In a Matrix room that all of them can access, I @mention whoever I need: the research bot collects sources, then I bring in the critic to pick the summary apart. Through Bot Mode, the bots can also message each other and hand off work, so a research result can pass through the critic before it reaches me. Group discussions give me several perspectives on one question at once. They also produce a lot of text, so I save them for questions that deserve it.

# Conclusion

Three narrow bots have turned out to be more useful than one agent that can do everything. Each one has a job I can describe in a sentence, the access that job needs, and a memory that stays on topic. If you want to try Bot Mode, start with one specialist whose work you repeat often, keep its permissions tight, and add the next bot when you catch yourself switching context again.

# References

- Hermes Agent v0.21.0 release notes - [link](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.31)
- Bot Mode guide, current - [link](https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode)
- Hermes Profiles: Running Multiple Agents - [link](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)
- Hermes Matrix Setup - [link](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/matrix)
- My earlier post on Hermes Agent - [link](https://michard.io/2026/hermes-agent-a-personal-ai-that-gets-more-useful-over-time/)