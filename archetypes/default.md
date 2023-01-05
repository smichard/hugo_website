---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["category"]
tags: ["tag-1","tag-2","tag-3"]
---

# Introduction

# Notice
{{< notice note >}}
This is a warning notice. Be warned!
{{< /notice >}}

{{< notice warning >}}
This is a very good tip.
{{< /notice >}}

{{< notice tip >}}
This is a warning notice. Be warned!
{{< /notice >}}

{{< notice info >}}
This is a very good tip.
{{< /notice >}}


# Summary
{{< figure src="/images/posts/test_image.jpg" title="test caption" >}}

# References