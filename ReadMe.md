# Hugo-Website Project
Hugo-Website project, the source code repository for my personal blog. This repository is where the magic happens - the development, deployment, and continuous updating of my personal blogging system. Utilizing Hugo, a popular open-source static site generator, this project embodies a sophisticated yet user-friendly approach to blog management. Coupled with the latest cloud technologies, it offers a streamlined, efficient, and automated workflow for publishing content. Details can be found [here](https://stephan.michard.io/2023/website-setup-and-workflow/).

[![Tag](https://img.shields.io/github/v/tag/smichard/hugo_website)](https://github.com/smichard/hugo_website/tags)
[![PRs](https://img.shields.io/github/issues-pr-raw/smichard/hugo_website)](https://github.com/smichard/hugo_website/pulls)
[![Registry](https://img.shields.io/badge/Quay-Container_Registry-46b9e5)](https://quay.io/repository/michard/hugo_website)
[![DevSpace](https://www.eclipse.org/che/contribute.svg)](https://devspaces.apps.ocp.michard.cc#https://github.com/smichard/hugo_website)


## Getting Started
Begin your journey with this project by cloning the repository. Ensure you have Git installed on your system:
```bash
git clone https://github.com/smichard/hugo_website
cd hugo_website
```

## Project Structure
Here's how the project is organized:

- Hugo Configuration: Contains all configurations and content for the Hugo site generation.
- Dockerfile: This file is used for containerizing the Hugo site, ensuring uniformity across various environments.
- Cloudbuild.yaml: Defines automated building and deployment steps via Google Cloud Build.

## Building the Website
Build the website locally using Hugo. After installing Hugo, run:
```bash
hugo
```
This compiles the website into static files in preparation for deployment.

## Containerization
To ensure consistency across different environments, the website is containerized using Docker. The Dockerfile in this repository is tailored for minimal footprint and high performance.

## Automated Deployment with Google Cloud
The project is seamlessly integrated with Google Cloud Build for automated building and deployment. Each commit triggers a pipeline that constructs the container image and deploys it to Google Cloud Run.

## License
This project is licensed under the MIT License. Refer to the LICENSE file for detailed information.

## References

- [Hugo Documentation](https://gohugo.io/)
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)