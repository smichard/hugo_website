---
title: "Shortcode examples"
date: 2023-01-04T21:55:58Z
draft: true
author: "Stephan Michard"
categories: []
tags: []

toc:
  enable: true
---

# New Hugo Post
```bash
hugo new posts/my-first-post.md
```

# Figure
{{< figure src="/images/posts/test_image.jpg" title="Caption" >}}


# Standard code blocks

## Without line numbers
````go
```bash
#!/bin/sh
docker build --no-cache --force-rm -t site .
docker run -p 8080:8080 site
```
````

## With line numbers
````go {linenos=table}
```bash {linenos=table}
#!/bin/sh
docker build --no-cache --force-rm -t site .
docker run -p 8080:8080 site
```
````

# Collapsible code blocks

Usage:
```go
{{</* collapsible-code language="CSS" title="Really cool snippet" id="1" isCollapsed="true" lineNos="true" */>}}
/* Css code here */
{{</* /collapsible-code */>}}
```

{{< collapsible-code language="CSS" title="Really cool snippet" id="1" isCollapsed="false" lineNos="false">}}
pre {
     background: #1a1a1d;
     padding: 20px;
     border-radius: 8px;
     font-size: 1rem;
     overflow: auto;
     @media (--phone) {
         white-space: pre-wrap;
         word-wrap: break-word;
    }
     code {
         background: none !important;
         color: #ccc;
         padding: 0;
         font-size: inherit !important;
    }
}
{{< /collapsible-code >}}

# Button
{{< button href="https://www.spiegel.de" >}}      Spiegel {{< /button >}}

# Blockquote

> my awesome blockquote

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