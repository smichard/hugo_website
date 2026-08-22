---
title: "HolmesGPT: A First Look at an Open-Source SRE Agent"
date: 2026-08-22
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["agent-ops", "ai", "sre", "holmesgpt"]
thumbnail: "/images/posts/post_41/overview.png"
toc:
  enable: false
---

{{< figure src="/images/posts/post_41/overview.png" title="HolmesGPT takes alerts and questions from developers as input, queries observability data, runbooks and cloud APIs to investigate them, and returns a root cause analysis or a pull request - [Source](https://github.com/HolmesGPT/holmesgpt)" >}}

## Introduction

I recently came across *[HolmesGPT](https://holmesgpt.dev/latest/)*, an open-source project designed to act as an autonomous SRE agent for Kubernetes and cloud environments. After spending the past few months working with [Hermes Agent]({{< relref "post_28.md" >}}), including deploying it on OpenShift and giving it access to a Kubernetes cluster, I was keen to see how a purpose-built operations agent would approach the same environment.

HolmesGPT starts from an alert or a question, calls tools to gather logs and metrics, and keeps investigating until it has a likely root cause. By default, it is read-only. In this post, I want to describe my first impression and how that diagnosis can be extended towards remediation, and where the approval step sits between the agent and any change to the cluster.

## How HolmesGPT Works

The core is an agentic tool-calling loop rather than a fixed set of rules. Give it an alert, and it iteratively queries whatever data sources are configured (Prometheus, Grafana, Loki, cloud APIs, the Kubernetes API itself) and builds a root-cause narrative from what it finds.

The practical consequence is that the investigation is not limited to failures someone anticipated. HolmesGPT can start from one alert and follow the problem across services taking into account data from various sources. That makes the investigation less predictable, and more useful when the cause is not a pattern anyone has seen before.

It supports most of the LLM providers you would expect, and it ships with more than sixty built-in toolsets. One of them is a dedicated OpenShift toolset that speaks `oc` directly rather than treating OpenShift as generic Kubernetes.

## The Read-Only Default

HolmesGPT respects whatever permissions its service account has, and out of the box that account is read-only. That is the right default. The agent can be pointed at a live cluster and asked why a pod is crashing without anyone worrying that a hallucinated tool call deletes something. The trade-off is that with those permissions the job ends at the diagnosis.  Going further is a deliberate decision (see below). Nevertheless a person is kept between the agent and the cluster.

## Deployment Options

HolmesGPT is moving quickly, so a step-by-step install guide here would be out of date within a few releases. The project documentation is good and covers the current options, so I keep it to a short overview.

For interactive use there is a CLI, which is the fastest way to ask a question about a cluster from a terminal. For a cluster-side installation there is a Helm chart, and there are integrations with chat clients, so an investigation can start in the same place where the alert is discussed.

The option I find most interesting is operator mode. HolmesGPT then runs as an operator in the cluster and is configured through custom resources: a `ScheduledHealthCheck` runs on a cron schedule, and a `TriggeredHealthCheck` runs automatically when a matching Deployment is rolled out. The agent stops being something you ask and becomes something that watches, 24/7, and reports what it finds in Slack.

Two limitations are worth knowing before trying it. Operator mode is alpha and subject to breaking changes, and every health check costs tokens, so a cron schedule is a recurring bill.

## Remediation Through a Pull Request

Operator mode changes what remediation can look like. With the GitHub integration connected, HolmesGPT can open a pull request instead of reporting a finding and stopping there.

If the cluster is managed with GitOps, that is the right place for a fix to land. The proposed change is reviewed and merged by a human, and it is applied by the reconciliation loop that owns the cluster state. The agent does not need write access to the cluster for any of it, so the read-only default stays intact. The audit trail is the Git history, which is the same trail every other change to the cluster leaves.

## Conclusion

I tried HolmesGPT on an OpenShift cluster, with the failure examples from the documentation and with deployments I broke myself. That is not a real incident, so I cannot say how well its root-cause narratives hold up during an actual outage.

Within that limited test the analysis was accurate and the suggested remediation steps were sensible. They were also close to what I would have concluded myself from the same logs. Nothing surprised me. For failures with a clear cause that is the expected outcome, and it still counts for something, because the agent got there without me reading anything.

Where I can see it paying off is in an environment with several clusters to manage, each with its own workloads and its own configuration. Working out why a workload fails on one of them, when no two clusters are set up alike, is the kind of task I would hand to an agent. HolmesGPT is developing quickly. This is a project I will keep watching, and I will test the new features as they arrive.

## References

- Hermes Agent: A Personal AI That Gets More Useful Over Time - [link]({{< relref "post_28.md" >}})
- HolmesGPT - project documentation - [link](https://holmesgpt.dev/latest/)
- HolmesGPT - GitHub repository - [link](https://github.com/HolmesGPT/holmesgpt)
- CNCF blog: Agentic troubleshooting built for the cloud native era - [link](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)
- HolmesGPT - operator mode - [link](https://holmesgpt.dev/latest/operator/)
