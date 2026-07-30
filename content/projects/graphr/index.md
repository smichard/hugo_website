---
title: "graphR"
date: 2022-11-02T20:34:39Z
draft: false
summary: "An R tool that turns a bulky RVTools export into a clear PDF report on any VMware environment."
github: "https://github.com/smichard/graphR"
weight: 2
---

**graphR** grew out of a recurring problem when sizing hyper-converged infrastructure back in the days when I was working at EMC in 2015. RVTools produces a large, detailed Excel export of a VMware environment, covering virtual machines, ESX hosts, and the network configuration. Reading that by hand is slow and easy to get wrong. graphR takes the export, runs the statistical analysis, and assembles the results into a single PDF report with the diagrams you actually need to reason about the environment.

The tool is written in R and ships as a Docker container, so it behaves the same on a laptop or a server. There is also a hosted version at graphr.de for a quick look without installing anything. Uploaded files live in a non-persistent container and are cleared every 15 minutes, so nothing is kept.

The accompanying post walks through how graphR works, how to run the container, and how to adapt the plots to your own reporting layout.

## References
- Blog Post - [link]({{< ref "/posts/post_3.md" >}})
- Web App - [link](https://www.graphr.de/)
- GitHub Repository - [link](https://github.com/smichard/graphR)
