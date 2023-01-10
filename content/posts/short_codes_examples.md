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

# Vimeo
{{< vimeo 146022717 >}}

# Youtube
{{< youtube w7Ft2ymGmfc >}}


# Calendly 1

{{< calendly calendar="stephan-michard" />}}

# Calendly 2

{{< calendly calendar="stephan-michard" >}}
  Book a time to talk now!
{{< /calendly >}}

# Download File
[Download](/images/posts/test_image.jpg)

# Figure
{{< figure src="/images/posts/test_image.jpg" title="Caption" >}}


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

