---
title: "hugo: build static site with Google Cloud Build"
date: 2022-10-29
draft: false
author: "Stephan Michard"
categories: ["cloud"]
tags: ["docker","gcp","hugo"]
---


# hugo: build static site with Google Cloud Build
I would like to automatically build a Docker container that displays the public files of a website created with the Hugo framework. Therefore I added the following Dockerfile to the root directory of the Hugo website:
```
FROM klakegg/hugo:0.104.3-onbuild AS hugo

FROM nginx
COPY --from=hugo /target /usr/share/nginx/html
```
The idea of this multi-stage build is to create the website files on the fly and display the result using a nginx container. When I create the container locally on my Ubuntu 20.04 Linux PC and then run it, everything works as expected and the website is available at `localhost:8080`:
```
docker build -t hugo-local .
docker run -d -p 8080:80 hugo-local
```

If I built the container with Google Cloud Build, the build process completes successfully. The files are also copied to the correct directory (`/usr/share/nginx/html`).

```
steps:
# This step builds the container image.
- name: 'gcr.io/cloud-builders/docker'
  id: Build
  args:
  - 'build'
  - '-t'
  - 'eu.gcr.io/gcp-project/hugo-cloud:$BUILD_ID'
  - '.'

# This step pushes the image to Container Registry
# The PROJECT_ID and SHORT_SHA variables are automatically
# replaced by Cloud Build.
- name: 'gcr.io/cloud-builders/docker'
  id: Push
  args:
  - 'push'
  - 'eu.gcr.io/gcp-project/hugo-cloud'
```

However, instead of rendering the website, the default nginx welcome page is displayed:
```
docker run -d -p 8080:80 hugo-cloud
```
![](/images/posts/nginx.png)

# Questions
What am I doing wrong? Any ideas? Feedback highly appreciated.

I tried various base images, various environments.