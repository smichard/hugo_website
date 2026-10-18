---
title: "From Vibe Coding to Spec-Driven Development"
date: 2026-11-08
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["ai", "agents", "coding-assistant", "coding", "tools", "workflow"]
thumbnail: "/images/posts/post_50/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_50/overview.png" title="OpenSpec, Beads and Worktrunk as one workflow - AI generated" >}}

## Introduction

This is the last post in my series on how my development workflow has changed. The previous three posts introduced [OpenSpec]({{< relref "post_47.md" >}}), [Beads]({{< relref "post_48.md" >}}) and [Worktrunk]({{< relref "post_49.md" >}}) one at a time. In this post, I connect them and describe the workflow I follow today, from an empty folder to merged code. First, though, a look at why I changed anything at all.

## Where Vibe Coding Stopped Working

Since the beginning of the year, I have built a number of small software projects with coding agents. At first, that meant what Andrej Karpathy called vibe coding: describe what you want and keep prompting until the result works. Gene Kim and Steve Yegge wrote a whole book about it, and I [reviewed it in April]({{< relref "post_26.md" >}}). For small experiments, it works. Over time, though, I ran into the same problems again and again.

Context was the first thing to go. A session lives in one terminal on one machine. After a reboot or a switch to another machine, the agent started from zero, and I spent the first prompts of each session explaining what we had done and what came next.

Long sessions caused the opposite problem, a kind of context gridlock. Every turn sends the full history along, so the token count climbs with each prompt. At some point, the agent spends more effort carrying old context than working on the task, and when the session is compacted, details I still needed disappear.

Even with plan mode, the work lacked structure. Agents pulled in memories that had nothing to do with the task, or proposed new features and fixes for unrelated bugs halfway through the work. Each idea made sense on its own. Together, they turned the plan into a pile of loose ends, which was frustrating.

My first attempt at a fix was a set of Markdown files that held the plan and the open tasks. They needed constant updates, by me or by the agent, and they still fell behind. A Markdown file does not know that one task blocks another or which agent is working on what.

## One Job per Tool

OpenSpec is where an idea becomes a plan. I describe the idea with the agent in the explore step until it becomes a written proposal with a task list. I leave some aspects open on purpose and decide them later, once there is something to look at.

The plan then moves into Beads. The tasks become beads, grouped by theme under epics, with priorities and dependencies. Because the Beads database travels with the Git remote, the state of the project survives a reboot or a switch to another machine. A new session starts with the Beads context, which a hook loads automatically, and `bd ready` tells the agent what to do next. Beads also helps with the detours. Its instructions tell the agent to create a bead before writing code, so a new idea or a bug found along the way usually ends up as a bead in the backlog instead of an unplanned change in the current task.

Worktrunk comes into play when several agents work at once. Each agent gets its own worktree on its own branch, so the agents can work through beads in parallel without overwriting each other's files.

## My Workflow

The Chart view I contributed to Beadbox, the desktop app for Beads, was planned this way: six OpenSpec changes with 69 tasks in total, released across Beadbox v0.28.0 to v0.28.2. The steps below are the ones I usually follow when I start a new project.

### Setting Up a New Project

Every project starts with an empty folder and `git init`. The first file I add is an instruction file for the agent, `CLAUDE.md` for Claude Code or `AGENTS.md` for Codex. Mine is based on the `CLAUDE.md` from the andrej-karpathy-skills repository, a short set of rules derived from Andrej Karpathy's observations on LLM coding pitfalls. Among other things, it asks the agent to state its assumptions before writing code and to keep its changes small.

Then I initialize Beads, connect the remotes, install the Beads integration for the agent I plan to use and initialize OpenSpec:

```bash
git init
bd init
bd quickstart
git remote add origin git@github.com:<user>/<project>.git
bd dolt push
bd setup claude    # or: bd setup codex
openspec init
```

`bd dolt push` sends the Beads database to the same remote as the code. On the next machine, `bd dolt pull` brings it back, which takes care of the machine switch from the beginning of this post.

### From Idea to Beads

With the project set up, I open a coding agent and run `/opsx:explore`. The agent asks questions until the idea is clear enough to write down, and `/opsx:propose` then writes the change folder with the proposal and the task list. I read all of it and correct what the agent got wrong. This takes longer than typing a prompt and hoping for the best, and it is the step where I spend most of my time today.

At the end of the propose step, I ask the agent to create epics and beads from the task list, with the beads grouped by theme under their epics. Then I look at the result in Beadbox, where the Chart view shows each epic as a timeline, and check the list in the terminal:

```bash
bd list
bd ready
```

{{< figure src="/images/posts/post_50/beadbox.png" title="The Chart view in Beadbox, with beads grouped under their epics and connected by their dependencies" >}}

### Handing Out the Work

For a single agent, the instruction is short: work on bead `<id>`, or on a whole epic. Alternatively, `/opsx:apply` implements the change directly from its task list.

When several agents work at the same time, each one gets its own worktree. Worktrunk creates the worktree and starts the agent in it with the prompt. Each line runs in its own terminal pane:

```bash
wt switch -x claude -c feature-a -- 'work on bead <id>'
wt switch -x claude -c feature-b -- 'work on bead <id>'
```

This works because Beads finds its database through the repository directory that all worktrees share. Every worktree of a repository reads and writes the same issues, so a bead that one agent claims in its worktree shows up as in progress for all the others.

### Watching and Merging

While the agents work, I follow their progress in Beadbox and in Herdr, the terminal multiplexer I [wrote about earlier this year]({{< relref "post_39.md" >}}). Herdr gives me one pane per agent and shows which agent is still working and which one is waiting for me. One more pane runs a live view of the beads (on macOS, `watch` comes from Homebrew):

```bash
watch -n 1 bd list
```

{{< figure src="/images/posts/post_50/herdr.png" title="Herdr with a live bd list, a shell, Claude Code and Codex in separate panes" >}}

When an agent has closed its bead, I merge its worktree with `wt merge`, which squashes and rebases the branch onto the default branch and removes the worktree. Worktrees keep agents from overwriting each other's files while they work. They do not prevent conflicts at merge time. If two beads change the same file, the second merge needs a rebase and sometimes a manual fix.

## What Changed

The biggest change is where my time goes. I spend more of it on planning and reviewing proposals and less on fixing code that the agent wrote from a misunderstanding. For small projects, the total time from idea to working software has gone down considerably.

Token usage went down as well, because each agent session starts with one bead and the matching part of the spec instead of a long conversation history. That is my impression, at least, and I cannot back it with numbers yet. I started sending traces of my Claude Code sessions to a self-hosted MLflow instance in October, and it records token usage and cost per turn. That gives me numbers from now on, but no baseline from before I changed the workflow.

## Limits and Open Ends

Spec-driven development has critics. Birgitta Böckeler from Thoughtworks looked at Kiro, Spec Kit and Tessl on martinfowler.com and wrote: "To be honest, I'd rather review code than all these markdown files." She also doubts that one fixed workflow fits a small bug fix as well as a large feature. Both points are fair, and the second matches my experience. For a feature, the full OpenSpec cycle pays off. For a two-line fix, it is too much, and a single bead or a direct prompt does the job.

OpenSpec and Beads also overlap. Both keep a task list, `tasks.md` in the OpenSpec change and the beads in the database. With `/opsx:apply`, the agent ticks off `tasks.md`. When it works through beads, it closes beads. Mixing both in one change means that one list falls behind the other. The cleaner split is to use OpenSpec for what to build and why, and Beads for the progress.

## Conclusion

At the start of the year, a new project began with a prompt. Today it begins with a conversation about what to build, and the code comes later.

If you work with coding agents and recognize the problems from the beginning of this post, OpenSpec and Beads are the two tools I would try first. Worktrunk becomes useful once you run more than one agent at a time.

## References

- Part one of this series: OpenSpec - [link]({{< relref "post_47.md" >}})
- Part two of this series: Beads - [link]({{< relref "post_48.md" >}})
- Part three of this series: Worktrunk - [link]({{< relref "post_49.md" >}})
- Herdr: Panes for My Folders, One Place for My Agents - [link]({{< relref "post_39.md" >}})
- Book Review: Vibe Coding by Gene Kim and Steve Yegge - [link]({{< relref "post_26.md" >}})
- andrej-karpathy-skills: CLAUDE.md - [link](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md)
- Birgitta Böckeler: Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl - [link](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- Beadbox - [link](https://beadbox.app/en)
- MLflow: Tracing Claude Code - [link](https://mlflow.org/docs/latest/genai/tracing/integrations/listing/claude_code/)
