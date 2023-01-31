---
title: "Shortcode examples"
date: 2021-01-01T21:55:58Z
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

# Code blocks

## Standard code blocks

### Standard code block with line numbers

Code:

````text
```bash {linenos=true}
#!/bin/sh
mkdir dir  
mkdir -p dir_root/{dir_b}/{dir_l1,dir_l2} 
```
````

Result:

```bash {linenos=true}
#!/bin/sh
docker build --no-cache --force-rm -t site .
docker run -p 8080:8080 site

echo Some text to print out 
cat file
a=10
b=$a
let a+=10
ls
mkdir dir  
mkdir -p dir_root/{dir_b}/{dir_l1,dir_l2} 
cd dir_root
cd "dir name"
cd ~
cp file $output
```

### Standard code block without line numbers

Code:

````text
```html
<div class="my_toc">
    <hr />
    <h1>Table of contents</h1>
    {{ .Page.TableOfContents }}
    <hr />
</div>
```
````

Result:

```html
<div class="my_toc">
    <hr />
    <h1>Table of contents</h1>
    {{ .Page.TableOfContents }}
    <hr />
</div>
```

## Collapsible code blocks

1. Collapsed code block with line numbers
2. Collapsed code block without line numbers
3. Expanded code block with line numbers
4. Expanded code block without line numbers

### 1. Collapsed code block with line numbers

Code:

```go
{{</* collapsible-code language="CSS" title="Really cool CSS snippet" isCollapsed="true" lineNos="true" */>}}
pre {
     background: #1a1a1d;
     padding: 20px;
     border-radius: 8px;
     font-size: 1rem;
     overflow: auto;
}
{{</* /collapsible-code */>}}
```

Result :

{{< collapsible-code language="CSS" title="Really cool CSS snippet" isCollapsed="true" lineNos="true">}}
pre {
     background: #1a1a1d;
     padding: 20px;
     border-radius: 8px;
     font-size: 1rem;
     overflow: auto;
}
{{< /collapsible-code >}}

### 2. Collapsed code block without line numbers

If you don't want to show line numbers, either set the `lineNos` parameter to `false` or simply omit the parameter, in which case it defaults to `false`.

Code:

```go
{{</* collapsible-code language="python" title="Really cool Python snippet" isCollapsed="true" */>}}
first_name = "Stephan"
last_name = "Michard"

print("Hello",first_name last_name,"good to see you")

thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
{{</* /collapsible-code */>}}
```

Result:

{{< collapsible-code language="python" title="Really cool Python snippet" isCollapsed="true" >}}
first_name = "Stephan"
last_name = "Michard"

print("Hello",first_name last_name,"good to see you")

thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
{{< /collapsible-code >}}


### 3. Expanded code block with line numbers

If you want the code to be expanded (displayed), either you can set `isCollapsed` to `false` or simply omit the parameter in which case, it defaults to  `false`

Code:

```go
{{</* collapsible-code language="CSS" title="Really cool snippet" isCollapsed="false" lineNos="true" */>}}
pre {
     background: #1a1a1d;
     padding: 20px;
     border-radius: 8px;
     font-size: 1rem;
     overflow: auto;
    }
{{</* /collapsible-code */>}}
```

Result :

{{< collapsible-code language="CSS" title="Really cool snippet" isCollapsed="false" lineNos="true" >}}
pre {
     background: #1a1a1d;
     padding: 20px;
     border-radius: 8px;
     font-size: 1rem;
     overflow: auto;
    }
{{< /collapsible-code >}}

### 4. Expanded code block without line numbers


If you want the code to be expanded and to be shown without line numbers, you can simply omit the respective parameters.

Code:

```go
{{</* collapsible-code language="python" title="Really cool Python snippet" */>}}
first_name = "Stephan"
last_name = "Michard"

print("Hello",first_name last_name,"good to see you")

print("Dear {} {}, hope you're well!".format(last_name,first_name))

thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
{{</* /collapsible-code */>}}
```

Result:

{{< collapsible-code language="python" title="Really cool Python snippet" >}}
first_name = "Stephan"
last_name = "Michard"

print("Hello",first_name last_name,"good to see you")

print("Dear {} {}, hope you're well!".format(last_name,first_name))

thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
{{< /collapsible-code >}}

# Button
{{< button href="https://www.spiegel.de" >}} Spiegel {{< /button >}}

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