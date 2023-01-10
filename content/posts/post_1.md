---
title: "Website setup and workflow"
date: 2023-01-06
draft: false
author: "Stephan Michard"
categories: ["Google Cloud"]
tags: ["Hugo","Cloud Run","Cloud Build", "Google Cloud"]

toc:
  enable: true
---
 
# Introduction
In this first blog post I want to describe the workflow and the tools I use to operate this website and how I publish new content. My focus with this workflow is that I want to be able to publish new posts very quickly. Furthermore, the maintenance should be effortlessly and I want to minimize the dependence to a hosting provider. Last but not least, the website should be very cost efficient to run.

# Tools
Being a big fan of Google Cloud Platform, I wanted to use Google Cloud Build and Google Cloud Run. Overall, I use the following tools:
- Hugo - as static site generator
- GitHub - as version control solution
- Google Cloud Build - to automatically build container images and to deploy containers to Google Cloud Run
- Google Cloud Container Registry - to store the generated container images
- Google Cloud Run - to run the container


# How it's all connected
In the following section I am going to describe how the tools work together to enable the workflow to publish the website easily and automatically. The source code for a sample website is hosted on GitHub - [link](https://github.com/smichard/boilerplates/tree/main/hugo_blog).

## Hugo basics
A comprehensive introduction to the Hugo framework is beyond the scope of this post. Therefore, only the essential aspects will be presented here.  
Once Hugo is installed on the PC, a new website can be created with the following command. This command creates the required structure and all essential files:
```
hugo new site <site_name>
```
With the following command the web page is generated and can be viewed in a browser. By default, a webserver is created such that the website is available at `localhost:1313`. The view is live, which means that changes to the configuration files or the text contributions are immediately visible:
```
hugo server
```
New posts can be created using the following command, this command generates a new file in the `posts` folder: 
```
hugo new posts/<post_name>.md
```

Themes are stored in the `themes` folder. Typically these are added as *git submodules*, this has the advantage that changes to the orginal theme can be included via a *git merge* command:
```
git submodule add <theme_link> themes/<theme_name>
```

If the web page is to be published, the following command can be executed. In this step, all static web pages are generated and stored in the `public` folder. The contents of this folder will eventually be published:
```
hugo
```

## Leveraging container technology
To ensure the portability of the website, a container image is generated in the workflow. The following Dockerfile is used for this purpose:
```
FROM klakegg/hugo:0.105.0-ext-alpine-onbuild AS hugo

FROM nginx:alpine
COPY --from=hugo /target /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
```
In this case, a Docker multi-stage build is used. Multi stage builds allow each stage to produce a set of intermediate image layers that can be used as the base for the next stage. This allows to create a final image that only includes the necessary dependencies and components resulting in a smaller, more lightweight image.  
The first line takes care of building the static web pages, as described at the end of the previous section by the `hugo` command. In the following, the result of the build process is copied to the `/usr/share/nginx/html` folder of a *nginx* based container iamge.  
The choice of *Alpine Linux* based container images leads to very lightweight and secure container images. On the one hand, this ensures short build times and, on the other hand, that small capacity is occupied in the container registry.  
The last line of the Dockerfile ensures that the cofiguration file `nginx/default.conf` for the *nginx* webserver is present in the container image. This configuration file ensures that the container exposes port *8080*. This step simplifies subsequent hosting on Google Cloud Run, since Cloud Run expects this container port by default.   
```
server {
    listen       8080;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /404.html;
    location = /404.html {
        root   /usr/share/nginx/html;
    }
}
```
The following commands can be used to create the container image locally and run the container locally. The website should then be available on `localhost:8080`:
```
docker build -t <image_name> .
docker run -d -p 8080:8080 <image_name>
```

## Leveraging Google Cloud Builds and Google Cloud Run
The last section described why container technology is used and how the final container image can be generated locally. In this section, it is described how the final image can be generated leveraging Google Cloud Build. In order to use Google Cloud Build a `cloudbuild.yaml` configuration file is required. This file defines several steps of the total build pipeline, the individual steps are executed one after the other. Using a `cloudbuild.yaml` file allows to define the complete build process in a declarative way, making it easy to repeat and automate the build and the deployment process.  
The content of the `cloudbuild.yaml` is as follows:
```
steps:
# This step fetches git submodulesbuilds.
- name: gcr.io/cloud-builders/git
  id: Git
  args:
  - 'submodule'
  - 'update'
  - '--init'
  - '--recursive'

# This step builds the container image.
- name: 'gcr.io/cloud-builders/docker'
  id: Build
  args:
  - 'build'
  - '-t'
  - 'eu.gcr.io/${PROJECT_ID}/hugo-website:${BUILD_ID}'
  - '.'

# This step pushes the image to Container Registry
# The PROJECT_ID and BUILD_ID variables are automatically
# replaced by Cloud Build.
- name: 'gcr.io/cloud-builders/docker'
  id: Push
  args:
  - 'push'
  - 'eu.gcr.io/${PROJECT_ID}/hugo-website:${BUILD_ID}'

# deploy container image to Google Cloud Run
- name: 'gcr.io/cloud-builders/gcloud'
  id: Deploy
  args:
  - 'run'
  - 'deploy'
  - 'hugo-website'
  - '--image'
  - 'eu.gcr.io/${PROJECT_ID}/hugo-website:${BUILD_ID}'
  - '--region'
  - 'europe-north1'
  - '--platform'
  - 'managed'
  - '--allow-unauthenticated'
```
The individual steps are described below:
1. the first step ensures that git submodules are also pulled. This step is necessary because the themes are usually included as git submodules, as described earlier.
2. the second step creates the final container image using the Dockerfile previously described. The name of the container image is composed of several elements. At the beginning the region of the Google Cloud Container Registry is used, followed by the Project ID of the Google Cloud Project. This is followed by a freely selectable name, in this case `hugo-website`, followed by the current build ID, which is used as a tag.
3. the third step pushes the created container image into the Google Cloud Container Registry.
4. the fourth deploys the created container image to Google Cloud Run. The container is launched in a managed Kubernetes cluster. In this step the container image is referenced, a name is used which in this case is `hugo-website`, finally the region in which the container is to be started is specified and since this is to be a publicly accessible website, it is defined that users do not have to authenticate themselves.

In the last step Google Cloud Run automatically generates a URL where the web page can be accessed. Using the *Manage Custom Domain* function and then *Add Mapping* in the Google Cloud Console, a custom domain can be linked to the Google Cloud Run service. To do this, the domain must be verified once with Google Cloud. To use a specific subdomain, a CNAME entry must then be set to *ghs.googlehosted.com* at the domain provider.
{{< figure src="/images/posts/post_1_mapping.png" title="Mapping a custom domain to the Google Cloud Run service" >}}


## Connecting GitHub and Google Cloud Builds  
This section focuses on the missing element that completes the workflow by connecting GitHub with Google Cloud Build.  
To do this, a trigger must be set up in the Google Cloud Console at the Google Build Service. A name must be selected for this trigger, then it must be defined which event should activate this trigger. For the given case, the option *Push to branch* is selected here. Under Source, the GitHub repository and the branch can be selected. Finally, the reference to the `cloudbuild.yaml` file must be created.
{{< figure src="/images/posts/post_1_trigger.png" title="Creating a trigger to automatically deploy the website on each git commit" >}}

This completes the workflow. Now with each *git commit* towards the *GitHub* repository, the Google Cloud Build process is triggered, which creates the container image and then deploys the container to Google Cloud Run.


# Summary
{{< figure src="/images/posts/post_1_summary.png" title="Presentation of the complete workflow" >}}

In this post, I describe the workflow I use to publish this website. For me it is the ideal workflow. I like the high degree of automation which allows me to publish fast and effortlessly. Maintaining this workflow requires negligible effort and running the workflow and the website is very cost-efficient.

# References
- Hugo Documentation - [link](https://gohugo.io/)
- Demo Code - [link](https://github.com/smichard/boilerplates/tree/main/hugo_blog)
- Google Cloud Build documentation - [link](https://cloud.google.com/build/docs)
- Google Container Registry documentation - [link](https://cloud.google.com/container-registry/docs)
- Google Cloud Run documentation - [link](https://cloud.google.com/run/docs)
- Docker multi-stage builds documentation - [link](https://docs.docker.com/build/building/multi-stage/)
- Git submodules documentation - [link](https://git-scm.com/book/en/v2/Git-Tools-Submodules)