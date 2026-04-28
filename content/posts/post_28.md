---
title: "Hermes Agent: A Personal AI That Gets More Useful Over Time"
date: 2026-05-02
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Books"]
tags: ["book-review","literature"]
toc:
  enable: false
---

{{< figure src="/images/posts/post_28/overview.png" title="How Hermes Agent Works: From Closed-Loop Learning to Multi-Platform Deployment - AI generated" >}}

## Introduction

I came across [*Hermes Agent project*](https://github.com/nousresearch/hermes-agent) in early March 2026 and deployed it a couple of days later. A couple of weeks in I am still using it daily, and the use cases keep expanding rather than converging. Most tools settle into a narrow routine or fall off altogether. What keeps this one going is that the agent gets more useful the longer you run it. The project is young and moving fast, with new releases every few days. The initial setup requires patience: getting the configuration to a point where it actually saves time takes effort, and the frequent updates occasionally introduce breaking changes. That said, it is genuinely fun to use, and you learn a fair amount along the way.

Hermes Agent is an open-source, self-hosted AI agent framework built by [*Nous Research*](https://nousresearch.com/), an independent AI research lab based in Austin, Texas. Nous Research is best known for the Hermes model family, a series of open-weight models fine-tuned on Llama that are used widely in the open-source AI community. The agent framework shares the name but is a separate product. It is MIT-licensed, model-agnostic, and runs on your own infrastructure, either as a self-hosted Python service or as a containerized deployment.


# How It Works

The part that makes Hermes Agent different from most agent frameworks is the skill system. The agent ships with a set of preconfigured skills covering common tasks. Beyond that, you can ask it to create a skill from something it just did: it writes a structured markdown document capturing the approach, what worked, and edge cases. The next time a similar task appears, the agent loads the relevant skill rather than starting from scratch. Skills can be triggered directly by asking Hermes to run one, or set on a schedule and executed automatically at defined intervals. Over time this turns completed work into a growing library of reusable operating knowledge.

Alongside the skill system, the agent maintains three layers of memory: a persistent store for completed tasks and notes, a full-text search index across prior sessions, and a user model that accumulates preferences over time, coding style, communication tone, timezone, tools. The idea is that the agent gets more useful the longer you run it, not just better at individual tasks in isolation.

## My Setup

Hermes Agent runs in my [homelab]({{< relref "post_18.md" >}}) as a service on a dedicated Linux host. Keeping it on a separate machine gives me direct control over what the agent has access to. Incoming traffic is routed through Traefik. I access it through three entry points depending on where I am and what I am doing. The primary interface is the [*Matrix*](https://matrix.org/) chat protocol, which means I can reach the agent from any Matrix client on any device. I also connected it to a dedicated email inbox, so it can handle certain tasks asynchronously. For longer sessions at my desk I use *Open WebUI* (see previous [post]({{< relref "post_19.md" >}})), which gives a more comfortable interface for extended conversations.

The model configuration is versatile: the agent supports various AI services and model providers.

## What I Gave It Access To

I gave the agent access to three local knowledge sources: my bookmarks, a structured knowledge base, and a local mirror of Red Hat product documentation.

The first is my bookmarks folder. I have been saving links as markdown files in Obsidian for several years. The agent can search and cross-reference that collection when doing research, which means it draws on context I actually care about rather than training data alone.

The second is a knowledge base built on the [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) principle described by Andrej Karpathy. The idea is to maintain a curated set of structured markdown files that an AI agent helps write and update over time. Topics, entities, comparisons, each in its own file. The agent both contributes to this knowledge base and draws from it when working on research tasks.

The third is a local mirror of Red Hat product documentation. A colleague built a tool called *rh-mastery* that pulls documentation from docs.redhat.com, converts it to Markdown, and stores it in a structured local directory. Pointed at that directory, Hermes can query accurate, version-tracked product documentation without touching the internet. For someone who spends a lot of time with Red Hat products, this closes a gap that is easy to overlook until you actually need it. More on rh-mastery in a [upcomming post]({{< relref "post_22.md" >}}).

## Practical Uses

The combination of bookmarks, structured knowledge, Red Hat product documentation, and the skill system makes the agent genuinely useful for research. When I ask it to investigate a topic, it starts with what I have already collected locally: prior notes, bookmarks, and documentation. If that is not enough, and when asked, it reaches out to the web to fill the gaps. The result is something grounded in context I actually care about.

One use I did not expect to find as useful: slide generation. I integrated *Marp*, a markdown-based presentation framework, into the workflow. When I need to put together a presentation and am staring at a blank file, I can ask the agent to draft an initial structure. Getting past that first empty screen is often the hardest part. Whether I keep most of what it produces is a different question, but having something to react to is worth more than nothing to start from.


## Skills and Subagents

The agent can develop and add skills on its own as it works, but skills can also be added manually or loaded from the community hub at [agentskills.io](https://agentskills.io). More interesting to me is the subagent capability: the agent can delegate tasks to specialized subagents, each backed by a specific AI service or holding a particular context. This makes it possible to compose workflows where different parts of a task go to the most appropriate model.


## Conclusion

Several weeks in is not a long track record, and the project is still moving fast enough that some things will break between releases. That said, the architecture is sound and the development pace is reassuring rather than worrying. Whether I will keep running it long-term, I genuinely do not know. For now, it is pulling its weight. For anyone already running a homelab and looking for a self-hosted agent that gets more useful over time rather than staying flat, Hermes Agent is worth the setup time.

Peter Steinberger, the creator of *OpenClaw*, another widely-used AI agent framework, put it well in a recent [TED talk](https://www.youtube.com/watch?v=7rzYDM6vMtI): "The bottleneck is no longer typing. It's thinking." That observation fits. The agent handles the mechanical parts of research and structuring. The judgment about what matters and what to do with it still has to come from someone. For now, a human in the loop is still necessary.

## References

- Hermes Agent on GitHub - [link](https://github.com/nousresearch/hermes-agent)
- Hermes Agent Documentation - [link](https://hermes-agent.nousresearch.com/docs/)
- Nous Research - [link](https://nousresearch.com/)
- Matrix - [link](https://matrix.org/)
- OpenRouter - [link](https://openrouter.ai/)
- Andrej Karpathy LLM Wiki concept - [link](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Marp - [link](https://marp.app/)
- agentskills.io - [link](https://agentskills.io/)
- Peter Steinberger TED talk - [link](https://www.youtube.com/watch?v=7rzYDM6vMtI)