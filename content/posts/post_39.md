---
title: "Herdr: Panes for My Folders, One Place for My Agents"
date: 2026-07-19
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["cli", "terminal", "ai", "agents", "productivity"]
thumbnail: "/images/posts/post_39/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_39/overview.png" title="Screenshot taken from the Herdr website. Herdr runs coding agents in terminal panes and shows their status in a sidebar" >}}

## Introduction

I recently came across [*Herdr*](https://herdr.dev/), a terminal multiplexer built around AI coding agents, and it has quietly turned into one of the tools I use daily. I did not go looking for it. One of my teammates suggested it to me. After installing it and watching [this tutorial](https://youtu.be/qnIu-Xu64H0?si=k8LP10dVMDjVrIo9), I quickly made Herdr part of my work routine. It helped me get rid of the small, repetitive terminal habits I never bothered to fix.

## What Herdr Is

Herdr calls itself "One terminal. The whole herd." It is a single Rust binary, no Electron, no account, no telemetry, and it sits on the same real PTY pane model that tmux and Zellij use. What it adds on top is agent awareness. Each pane can report whether the agent running inside it is working, blocked on a prompt, done, or idle, and Herdr shows that state directly in a sidebar. It supports Claude Code, Codex, Copilot CLI, Cursor Agent, and more than a dozen others. The project is open source under AGPL-3.0, with a commercial license available for organizations that cannot work with AGPL's terms, and it is built by a single developer, Ogulcan Celik. Install is a one-liner, `brew install herdr` on macOS, or a binary download from the GitHub releases page.

## Panes Instead of Folder Navigation

Before Herdr, my terminal habits were fine but a bit wasteful. I would open a terminal, `cd` into a folder I use often, then either `open .` to get to it in Finder or `code .` to open it in VS Code. Multiply that by the handful of projects and folders I touch every day, and it adds up to a lot of typing that says nothing new. I assumed there were already tools solving exactly this, and there probably are. What changed for me is that Herdr's panes gave me a place to put the fix without adopting a separate app for it.

I set up a workspace with panes for the folders I return to most: my Obsidian Vault, my homelab repo, a couple of active coding projects. Each pane opens already sitting in the right directory. Switching between them is a keystroke instead of a `cd` and a guess at how many `../` I need. It is a small thing, but it removed a piece of friction I had stopped noticing, which is usually the sign that a tool is doing its job.

## One Place for All My Agents

The bigger change is with agents. I had gotten into the habit of running Claude Code in one terminal window, Codex in another, and switching to a browser tab for a third, then alt-tabbing between all of them to check which one was still working and which one was sitting there waiting on me. It worked, but it meant I was doing the state-tracking myself, one window at a time.

With Herdr, all of that lives in one terminal. Each agent gets its own pane, and the sidebar tells me at a glance which ones are done, which are still working, and which are blocked on a prompt I have not answered yet. I no longer click into a pane just to find out nothing has changed. That alone has cut down how often I interrupt myself checking on agents that are not actually waiting for me.

## Conclusion

This post was meant as a short introduction to a tool I only recently discovered. Herdr can be adapted to different workflows through its plugin system. [Moshi](https://getmoshi.app/) adds another option by providing remote access to a terminal running Herdr from a phone or tablet. I have used this setup as well and found it very useful.  

For now, the two things that sold me are the ones I described here: panes that remove repetitive folder navigation, and one screen that tells me the state of every agent I am running instead of making me ask.

## References

- Herdr - [herdr.dev](https://herdr.dev/)
- Herdr on GitHub - [github.com/ogulcancelik/herdr](https://github.com/ogulcancelik/herdr)
- Herdr tutorial - [YouTube](https://youtu.be/qnIu-Xu64H0?si=k8LP10dVMDjVrIo9)
- Moshi - [getmoshi.app](https://getmoshi.app/)
