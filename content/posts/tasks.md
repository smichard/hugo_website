---
title: "Tasks"
date: 2023-01-04T21:55:58Z
draft: true
author: "Stephan Michard"
categories: []
tags: []

toc:
  enable: true
---



# Testing TOC 1
## Testing TOC 2
## Testing TOC 3
#### Testing TOC 4
#### Testing TOC 5
## Testing TOC 6
# Testing TOC 7
## Testing TOC 8
## Testing TOC 9
# Testing TOC 10

# Table of Contents
A table of content should be added to the theme. Please use the FixIt Theme for guidance ([GitHub Link](https://github.com/hugo-fixit/FixIt) and [Theme Documentation Link](https://fixit.lruihao.cn/)). The Table of contents should be displayed to the side of the post and slide up and down with the scrolling of the text.
![toc 1](/images/posts/toc_1.png)

For small windows the Table of contents should be at the top of the post in a collapsible box.
![toc 2](/images/posts/toc_2.png)

The table of contents should only be displayed for posts where the toc is enable in the frontmatter of the post:
```
toc:
  enable: true
```

# collapsible code blocks with Syntax highlighting
The code block should be collapsible, it should have a copy to clipboard button and have syntax highlighting. It should work with various types of code.
I like this implementation:
![Code Block](/images/posts/code_block.png)

## Testing code blocks:
### bash
```bash
#!/bin/sh

docker build --no-cache --force-rm -t site .

docker run -p 8080:8080 site
```

### HTML
```html
<div class="my_toc">
    <hr />
    <h1>Table of contents</h1>
    {{ .Page.TableOfContents }}
    <hr />
</div>
```

### CSS
```css
figcaption {
	color: white;
	font-size: 1.1em;
	font-weight: 400;
	line-height: 2em;
}
```

### Javascript
```javascript
(function () {
    function onEvent() {
      var filter = search.value.toUpperCase();
      var list = document.getElementById("list");
      var filterTags = document.getElementById("list").getElementsByTagName("article");
      var listItems = list.getElementsByTagName("article");
      for (i = 0; i < listItems.length; i++) {
        var item = listItems[i];
        var textnode = listItems[i].childNodes[3].childNodes[1]
        var text = textnode.innerText.toUpperCase();
      }
    }
  })();
  ```

### YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # tells deployment to run 2 pods matching the template
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

# Download File
An attachements link should be added. Instead of opening the file in the browser it should be downloaded directly. This should work for jpg and pdf files:
[Download 1](/images/posts/test_image.jpg)
[Download 2](/images/posts/test_doc.pdf)

# Bonus: Implement nicely looking Blockquote and
I saw in your proposal, that you implemented a blockquote and alerts. If you have time left, please implement it here aswell:
![blockquote](/images/posts/blockquote.png)
![alerts](/images/posts/alerts.png)

# Comment
Please indicate the files you added or edited. Please use a comment within the files you edited.
```
# for HTML
<!-- ft-adjustment: <your comment> --->
# for css
/* ft-adjustment: <your comment> */
```