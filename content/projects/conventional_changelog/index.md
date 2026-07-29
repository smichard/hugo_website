---
title: "Conventional Changelog"
date: 2022-11-02T20:34:39Z
draft: false
summary: "Turns a git commit history into a structured changelog, runnable locally, as a GitHub Action, or as a Tekton task."
github: "https://github.com/smichard/conventional_changelog"
weight: 3
---

Keeping a changelog current is the kind of task that quietly slips once a project gets busy. **Conventional Changelog** automates it. It reads a repository's commit history and produces a structured CHANGELOG file, following the Conventional Commits and Semantic Versioning conventions together with the Keep a Changelog format. I added a few commit categories of my own, such as `deploy:`, `gitops:`, and `demo:`, to cover changes that the standard set does not describe well.

The tool fits into whatever workflow is already in place. Run the script directly on your laptop, run it inside a Podman or Docker container, wire it in as a GitHub Action so the changelog updates on every push to `main`, or add it as a task in a Tekton pipeline on Kubernetes or OpenShift.

A dedicated blog post explains the reasoning behind each convention and provides examples for every execution method. It was also published on opensourcerers.org.

## References
- Blog Post - [link]({{< ref "/posts/post_11.md" >}})
- Opensourcerers Article - [link](https://www.opensourcerers.org/2024/03/25/enhancing-code-project-documentation-through-automated-changelogs/)
- GitHub repository - [link](https://github.com/smichard/conventional_changelog)
- GitHub Action on the Marketplace - [link](https://github.com/marketplace/actions/generate-changelog-based-on-conventional-commits)
