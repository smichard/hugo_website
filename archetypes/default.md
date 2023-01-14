---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["category"]
tags: ["tag-1","tag-2","tag-3"]

toc:
  enable: true
---

# Introduction

# Image
{{< figure src="/images/posts/test_image.jpg" title="test caption" >}}

# Code

## Collapsible code block

{{< collapsible-code language="python" title="Really cool Python snippet" isCollapsed="true" >}}

# comment

{{< /collapsible-code >}}

## Standard code block

```html
# comment
```

# Notice
{{< notice note >}}
It's worth to notice that: ...
{{< /notice >}}

{{< notice warning >}}
This is a warning message.
{{< /notice >}}

{{< notice tip >}}
This is a very good tip.
{{< /notice >}}

{{< notice info >}}
This is an info notice.
{{< /notice >}}

# Summary

# References