---
title: "A Hugo Theme for Your CV"
date: 2027-04-16
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Tools"]
tags: ["Hugo", "CV", "Git", "Workflow", "Tooling"]
toc:
  enable: false
status: RTP
---

## Introduction

When I was still working as a researcher, LaTeX was part of the daily workflow. Writing papers in it made the jump to a LaTeX CV feel natural at the time. But some years later, outside of academia, the setup started to feel unnecessarily complicated.

When I came across the *Resume A4* [Hugo theme](https://github.com/mertbakir/resume-a4) created by [Mert Bakir](https://github.com/mertbakir), it solved the problem in a way that fit naturally into a workflow I was already using. Since [my blog]({{< relref "post_1.md" >}}) runs on *Hugo*, adding a CV as a separate Hugo site means staying in the same toolchain. The content is version-controlled with Git, the design is controlled by CSS, and local preview is a single command away.

## How It Works

Resume A4 is a Hugo theme that renders a single-page, A4-sized CV as a static website. All content lives in YAML files under a `data/` directory: work experience, education, skills, publications. The theme reads those files and produces the layout. Having separate files for content and design is one of the key advantages of this setup. Updating the CV content never requires touching the design, and changing the visual appearance never requires touching the content files.  

Setting it up takes about five minutes:

```bash
hugo new site my-resume
cd my-resume
git submodule add https://github.com/mertbakir/resume-a4 themes/resume-a4
```

Copy the example config and data files from `exampleSite/`, then start the local server:

```bash
hugo server -D
```

The site is available at `localhost:1313`. When the CV is ready, export to PDF by printing from the browser. No additional tooling required.

The YAML schema is straightforward. Two widget types handle most sections. The `details-list` widget covers structured entries with title, date, and description text, which works well for experience and education. The `word-list` widget handles flat lists, useful for skills or tools. Section order is configurable, so the layout can be adjusted without touching the theme itself.

## What I Like About This Setup

For me, having separate files for content and design works really well in practice. The CSS is self-contained and predictable, and with AI tools now making CSS edits more accessible, adjusting spacing, colors, or fonts is straightforward. No need to spend hours on Stack Overflow or W3Schools just to perform a minor change.

Having the CV under version control is also a big plus. It makes it easy to maintain different versions of the content or experiment with different designs.

Hosting the result as a static site is a side benefit. The CV can live at a subdomain, or be exported as a one-page PDF for submissions. Both options come from the same source.


## Conclusion

Resume A4 is a pragmatic tool for anyone already using Hugo and Git. The setup is minimal, the workflow is clean, and the separation between content and design makes ongoing maintenance straightforward. For a CV that is supposed to live in a repository, get reviewed occasionally, and be exported as a PDF when needed, it does what it needs to do without getting in the way. Many thanks to the creators for putting it together and making it available.

## References

- Resume A4 on GitHub - [link](https://github.com/mertbakir/resume-a4)

