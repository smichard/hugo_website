---
title: "graphR. - Visualizing RV Tool exports"
date: 2023-01-29T21:01:31+01:00
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Projects"]
tags: ["R","data analytics","HCI"]

toc:
  enable: true
---

# Introduction
With the advent of hyper-converged infrastructure (HCI), the initial question was how to design such a solution. Unfortunately, sizing tools were missing at the beginning. I found the evaluation of RV Tools very helpful to design HCI solutions, unfortunately, a detailed analysis could take a lot of time and be very error-prone. Therefore I developed a small tool called graphR. which automates the evaluation of RV Tools and compiles a visual presentation of the information contained within one Excel export.  
[RV Tools](http://www.robware.net/rvtools/) is a VMware utility that connects to a vCenter and gathers information with an impressive level of detail on the VMware environment (e. g. on virtual machines, on ESX hosts, on the network configuration). The data collection is fast and easy. The end result can be stored in a Microsoft Excel file. RV Tools exports are a great way to collect data on VMware environments. However, analyzing RV Tool exports, especially of complex environments can be time-consuming, error-prone, and cumbersome.  
That's where *graphR.* steps in. *GraphR.* processes RV Tool exports which are saved as Microsoft Excel or as comma-separated files. It performs statistical analysis on the data contained within the Microsoft Excel file. The dataset is visualized through some beautiful-looking diagrams. Finally, all tables and charts are assembled in one downloadable PDF report. Hence *graphR.* enables the generation of a concise report with some great graphics in order to derive meaningful insights on the analyzed VMware environment.  

The tool can be adjusted to your specific needs (see below) or used through the web tool:  
{{< button href="https://www.graphr.de" >}} visit the graphR. website {{< /button >}}  
  
{{< notice info >}}
The web tool is deployed using a non-persistent container. The uploaded file is cached for evaluation. A cron job ensures that the generated PDF files are deleted at 15-minute intervals. Therefore, no data is stored permanently.
{{< /notice >}}  

# Prerequisites
To run *graphR.* you just need an environment that supports Docker containers. To customize *graphR.* according to your needs the installation of the open-source programming language [R](https://www.r-project.org/) is recommended.

# Getting Started
The easiest way to use *graphR.* is to pull the latest pre-build Docker container from Dockerhub and run it within your environment. The following commands will download *graphR.* from Dockerhub and make it available in your environment on port *80*:
```bash
docker pull smichard/graphr
docker run -d -p 80:3838 smichard/graphr
```

# Customize
To customize *graphR.* according to your needs, e.g. by adding new ways to plot the data, altering threshold values, or adding a custom design just clone this repository:
```bash
git clone https://github.com/smichard/graphR.git
```
Since the core of *graphR.* is written in R the installation of R is recommended to see the changes taking effect. If you are using R-Studio as a code editor the *graphr_dashboard.Rproj* file contains all necessary files to adjust *graphR.*    

Following is a short description of the most important files:  

* *app.R* - the main file, which is needed by the Shiny web framework to display the web app. Here the GUI of the web app is described, also the *libraries.R* and the *server_rv.R* files are sourced
* *server_rv.R* - contains all necessary functions to ingest the raw data, perform some basic analysis, generate diagrams, and finally generate the pdf report
* *plottingFunctions.R* - a set of functions to display text, data frames, and diagrams on slides
* *libraries.R* - contains a list of all required R packages, and also sources the *plottingFunctions.R* file

In case you want to use custom backgrounds according to your corporate identity just replace the image files within the */graphr/backgrounds* folder and make sure to use the *.png* file format. The recommended image dimensions are 960 px times 540 px.

Once all changes are done you can build your own custom *graphR.* container using the following commands: 
```bash
docker build -t <project name> .
docker run -d -p 80:3838 <project name>
```

# How to use graphR.
The use of graphR. is designed to be simple: 

1. Collect the data with the [RV Tools](http://www.robware.net/rvtools/) and save the export as *.xls*, *.xlsx* or as *.csv* file
2. Upload the *.xls* / *.xlsx* file (recommended) or the *tabvInfo.csv* to graphR. and hit *Generate Report*
3. Enjoy your report

# Demo

Get a glimpse through this YouTube video:
{{< youtube dotbSX79FJg >}}


# Summary
The tool provides an easy way to systematically analyze RV tools. The evaluation is fast and straightforward. This evaluation helps to get a quick overview of existing VMware environments.

# References
- RVTools - [link](http://www.robware.net/rvtools/)
- graphR. website - [link](https://graphr.de/)
- GitHub repository - [link](https://github.com/smichard/graphR.git)
- R - The open source programming language for statistical computing - [link](https://www.r-project.org/)
- R-Studio - Used as code editor for R and for debugging and visualization - [link](https://www.rstudio.com/)
- Shiny - Used as web application framework for R - [link](https://shiny.rstudio.com/)
- Docker - Used to package all dependencies into one container - [link](https://www.docker.com/)