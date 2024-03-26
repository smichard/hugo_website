---
title: "Enhancing Code Project Documentation through Automated Changelogs"
date: 2024-03-26
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Projects"]
tags: ["coding","documentation","tutorial"]

toc:
  enable: true
---

## Abstract

In the rapidly evolving landscape of software development, documentation of modifications and updates is crucial for maintaining project continuity and ensuring team alignment. This blog article introduces **Conventional Changelog**, a tool developed to address this very challenge. The tool transforms a project’s commit history into a detailed, readable changelog. Its adherence to the Conventional Commits and Semantic Versioning practices fosters a well-structured documentation that enhances transparency for users and contributors alike. Versatile by design, it integrates seamlessly into various deployment environments, from local IDEs to continuous integration pipelines like GitHub Actions and Tekton Tasks.

## Motivation

As projects evolve, maintaining a clear history of changes becomes a challenge. Traditional methods often fall short, leading to overlooked updates or a cluttered changelog. The need for a solution that not only automates this process but also aligns with best practices in software development — such as Semantic Versioning and Conventional Commits — sparked the idea to develop the proposed tool. **Conventional Changelog** addresses this gap, offering a solution that is both comprehensive and easy to adopt, ensuring no code commit goes unrecorded.

The proposed approach integrates three foundational best practices to enhance a project’s documentation:

1. [**Semantic Versioning:**](https://semver.org/) This practice involves structuring version numbers as MAJOR.MINOR.PATCH. Each segment signifies the nature of changes: MAJOR versions indicate incompatible API changes, MINOR versions add features in a backward-compatible manner, and PATCH versions address backward-compatible bug fixes. This method provides a clear, incremental structure for versioning that reflects the scope and impact of changes.

2. [**Conventional Commits:**](https://www.conventionalcommits.org/en/v1.0.0/#specification) Building on the idea of structured commit messages, this practice categorizes code changes to clearly communicate their intent. Based on the [Angular Convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) for code commits, valid categories are: feat:, fix:, build:, chore:, ci:, docs:, style:, refactor:, perf:, and test:. The proposed tool introduces additional categories such as deploy:, gitops:, and demo:. The motivation is to cover code changes of deployment files (e.g. Kubernetes manifests), code changes which trigger automated GitOps-driven deployments, code changes which are motivated by demonstration purposes. This ensures a well-organized commit history.
    
3. [**Keep a Changelog:**](https://keepachangelog.com/en/1.1.0/) Advocates for maintaining a changelog as a curated list of notable changes for each project version. It emphasizes structuring the changelog in a way that is accessible and informative for users, grouping changes by type and listing them chronologically. Including an “Unreleased” section helps to offer visibility into the latest code commit which might be part of upcoming software releases.
    
Together, these practices offer a comprehensive framework for managing software versioning, commit documentation, and changelog maintenance, making it easier for teams to navigate the complexities of project development and for users to stay informed about significant updates.


## Executing the Script: A Multifaceted Approach

The tool can be operated in various ways. These methods are explained in more detail below. To avoid exceeding the scope, minimal examples for the individual options will be used. This flexibility allows developers to choose the best approach for their individual workflow, enhancing productivity and ensuring accurate documentation of project evolution.

### Local execution

**Conventional Changelog** stands out for its adaptability, easily incorporating into the local development environment. Developers can execute the script directly, ensuring their changelog remains up-to-date with every commit.
```bash
./generate_changelog_local.sh
```

Alternatively, utilizing a container engine like Podman or Docker offers an isolated setup, guaranteeing consistent execution across different environments Independent of the underlying operating system.

1. First, build the container image using the provided Dockerfile. This step creates an image with the necessary environment to run the script:
```bash
podman build -t <image-name> -f Dockerfile
```
2. After building the image, run the container. This step mounts the current working directory into the container, allowing the script to access and update the changelog file within the project directory:
```bash
podman run -it --rm -v "$(pwd):/repo" <image-name> sh
```
3. Inside the container, navigate to the mounted repository directory and execute the script. This process generates the changelog within the containerized environment, reflecting the changes back to the local repository:
```bash
cd repo
./generate_changelog_local.sh
```


### GitHub Action

Integrating **Conventional Changelog** into a CI/CD pipeline as a GitHub Action streamlines the process of keeping your changelog current and comprehensive. The configuration of the GitHub Actions workflow allows for the changelog generation to be initiated based on certain git operations, targeted branches, or through workflow dispatch, providing flexibility in how and when updates are documented.   
The following GitHub Actions workflow example is designed to trigger the automatic generation of an updated changelog with every code push to the main branch. For this functionality to operate correctly, it’s necessary to adjust the GitHub workflow permissions to have both read and write access in the repository settings (Settings -> Actions -> General -> Workflow permissions).

{{< collapsible-code language="YAML" title="GitHub Action Workflow" isCollapsed="false" >}}  
name: Generate Changelog

on:
    push:
      branches: [ main ]

jobs:
    changelog:
        runs-on: ubuntu-latest
        name: Generate and Commit Changelog

    steps:
        - name: Checkout Repository
          uses: actions/checkout@v4

        - name: Generate Changelog
          uses: smichard/conventional_changelog@2.0.0
          with:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

        - name: Set Git User Info
          run: |
          git config user.name 'GitHub Actions Bot'
          git config user.email 'actions@github.com'

        - name: Commit Changelog
          run: |
          git add CHANGELOG.md
          git commit -m "docs: :robot: changelog file generated" || echo "No changes to commit"
          git push
{{< /collapsible-code >}}

This automation streamlines the maintenance of the project’s documentation, ensuring a real-time, accurate account of changes, fixes, and new features. It’s a seamless process that saves time and improves accuracy, crucial for projects with frequent updates.


### Tekton Task

**Conventional Changelog** extends its versatility by offering seamless integration as a task within [Tekton pipelines](https://tekton.dev/docs/). This feature is particularly beneficial for users operating in Kubernetes and OpenShift environments, allowing for the automation of changelog generation as part of a deployment workflow.

1. Begin by applying the provided `tekton/task_generate_changelog.yml` configuration. This step enables using the provided Task as part of a Tekton Pipeline. Make sure to have the git-clone Task installed in your [cluster](https://hub.tekton.dev/tekton/task/git-clone):

```bash
oc apply -f tekton/task_generate_changelog.yml
```

2. Integrate the provided task into a Tekton pipeline. Find below a minimal pipeline configuration. This pipeline illustrates a minimal configuration which retrieves a Git repository and generates the changelog. However, the provided pipeline can serve as a blueprint to be adopted in a larger context. If the generated changelog file needs to be committed back to the repository, additional steps are required to handle the commit process:

{{< collapsible-code language="yaml" title="Minimal Tekton Task" isCollapsed="false" >}}
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: minimal-pipeline
spec:
    workspaces:
    - name: source
params:
    - name: git-url
      type: string
      description: "URL of the git repository"
tasks:
    - name: fetch-repository
      taskRef:
        name: git-clone
        kind: Task
      workspaces:
        - name: output
          workspace: source
      params:
        - name: url
          value: $(params.git-url)
        - name: revision
          value: "main"
    - name: generate-changelog
      taskRef:
        name: generate-changelog
      workspaces:
        - name: source
          workspace: source
      runAfter:
        - fetch-repository
{{< /collapsible-code >}}

3. Apply the pipeline:
```bash
oc apply -f tekton/pipeline
```

Integrating the solution as part of a Tekton pipeline, just as with a GitHub Action workflow, demonstrates the solution’s flexibility and ensures a timely and accurate record of changes, bug fixes, and new features.

## Summary

In a dynamic software development world, maintaining an accurate and comprehensive project history is pivotal for team alignment and project continuity. The introduction of **Conventional Changelog** offers a robust solution to this challenge, transforming commit histories into detailed, structured changelogs. This tool marries the principles of Conventional Commits and Semantic Versioning with the best practices of changelog maintenance, ensuring a transparent and accessible documentation process. Versatile enough to integrate with local IDEs, containerized environments, GitHub Actions, and Tekton Tasks, **Conventional Changelog** streamlines documentation workflows, making it an essential tool for developers seeking to automate and enhance their project documentation practices. This post presented the motivation behind **Conventional Changelog**, outlined its background, and provided practical guidance on its multifaceted execution strategies, demonstrating its utility in modern software development environments.

## References

1. GitHub Repository of Conventional Changelog - [link](https://github.com/smichard/conventional_changelog)
2. GitHub Action Marketplace - [link](https://github.com/marketplace/actions/generate-changelog-based-on-conventional-commits)
3. Semantic Versioning Specification - [link](https://semver.org/)
4. Conventional Commits Specification - [link](https://www.conventionalcommits.org/en/v1.0.0/#specification)
5. Angular Commit Message Guidelines - [link](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)
6. Keep A Changelog Specification - [link](https://keepachangelog.com/en/1.1.0/)
7. Tekton Documentation - [link](https://tekton.dev/docs/)
8. Documentation for the git clone Tekton Task - [link](https://hub.tekton.dev/tekton/task/git-clone)