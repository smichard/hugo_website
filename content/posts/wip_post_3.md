---
title: "Post_3"
date: 2022-01-27T15:10:33+01:00
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Projects"]
tags: ["Dell","Maintenance","Script"]

toc:
  enable: false
---

# Introduction
bla, bla, bla, a way to query systematically, not a api call, based on webscrapping, use moderately

# Getting started
{{< notice info >}}
This set of instructions was tested for Ubuntu 20.04
{{< /notice >}}  

Please visit the following website to find instructions on how to install Google Chrome and Chromedriver on Ubuntu 20.04:  
{{< button href="https://skolo.online/documents/webscrapping/#pre-requisites" >}} Install Chrome & Chromedriver {{< /button >}}  

Make sure to have python and pip installed:
```bash
sudo apt update
sudo apt install -y python3 python3-pip
```
Check the version of your pip installation:
```bash
pip3 --version
```

The version number may vary, but it will look something like this:
```bash
pip 20.0.2 from /usr/lib/python3/dist-packages/pip (python 3.8)
```

# Using the script

```bash
git clone 
```

```python
pip3 install -r requirements.txt
```

```python
python main.py <your_service_tag>
```

Example output:
```bash
Product : PowerEdge MX740c
Service Tag :  <your service tag>
Express Service Code :  <your express service code>
Support Services : <your support service level>       
Expires : <expiry date of the support service level>
```

# Summary
bladi bladi bla

# References
- Instruction to install Chrome and Chromedriver on Ubuntu 20.04 - [link](https://skolo.online/documents/webscrapping/#pre-requisites)
- GitHub Repository - [link]()