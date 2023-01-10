---
title: "Shortcode examples"
date: 2023-01-04T21:55:58Z
draft: true
author: "Stephan Michard"
categories: []
tags: []
---

# New Hugo Post
```
hugo new posts/my-first-post.md
```

# Figure
{{< figure src="/images/posts/test_image.jpg" title="Caption" >}}


# Button
{{< button href="https://www.spiegel.de" >}}Spiegel{{< /button >}}

# Download File

## Standard
{{< download file="/images/posts/test_image.jpg" >}}

## Adjust title
{{< download file="/images/posts/test_doc.pdf" title="Download pdf" >}}

## Adjust title and center on page
{{< download file="/images/posts/test_image.jpg" title="Download image" class="wrapper_download_center" >}}  

# Calendly 1

{{< calendly calendar="stephan-michard" />}}

# Calendly 2

{{< calendly calendar="stephan-michard" >}}
  Book a time to talk now!
{{< /calendly >}}


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

# Vimeo
{{< vimeo 146022717 >}}

# Youtube
{{< youtube w7Ft2ymGmfc >}}