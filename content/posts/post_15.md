---
title: "Compound Interest Calculator – Visualizing Capital Growth"
date: 2025-10-25
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io
"
categories: ["Projects"]
tags: ["R","Shiny","Finance"]

toc:
  enable: true
---

# Introduction

Understanding how capital develops over time is a cornerstone of financial planning. While compound interest formulas are straightforward on paper, the interplay between savings rate, interest, and time is often less intuitive. To address this, I built the Compound Interest Calculator – a Shiny app that visualizes how capital grows based on different input parameters.

The tool illustrates not only the raw numbers but also the dynamics of savings and interest accumulation. It allows you to model different scenarios, compare strategies, and identify milestones such as when your savings generate more returns than your yearly contributions.

The idea for this tool was sparked after watching a [YouTube video](https://www.youtube.com/watch?v=F3Q-1W4QEVI) that explains why the first €100,000 is such a critical milestone in building wealth. There are many excellent videos and articles that explore this concept in depth. But to make it truly tangible — and to experiment interactively with savings rates, interest assumptions, and time horizons — I decided to build a tool of my own. The result: a simple, hands-on way to see compound interest in action and explore how various strategies may impact the growth of your capital over time.

You can try the web tool here:  
{{< button href="https://compound-calculator.michard.io" >}} Open the Compound Interest Calculator {{< /button >}}

# Prerequisites

The easiest way to use the calculator is online (see above).  
If you want to run it locally, you’ll need:
- An environment capable of running containers, e.g. Podman, or
- R with Shiny installed.

# Getting Started

The online version is straightforward:

1. Open the Compound Interest Calculator.
2. Enter your investment parameters, e.g. start year, savings rate, interest rate, investment period.
3. Click Calculate and explore the generated charts and tables.

## Input Parameters
- **Start Year:** The year when the investment begins.
- **Initial Capital:** The amount of money you start with.
- **Savings Rate:** The amount of money you plan to save regularly.
- **Savings Interval:** The frequency at which you save the specified savings rate (either monthly or yearly).
- **Investment Period:** The total number of years you plan to invest.
- **Interest Rate:** The annual interest rate (as a percentage) that your capital will earn.
- **Adjustment Rate:** The annual rate (as a percentage) at which your savings rate will increase.
- **Savings Suspension:** The number of years after which you plan to stop saving money.
- **Target Value:** A specific capital value you aim to achieve. The app will indicate when (or if) this value is reached.
  
## Generated Diagrams
- **Overview:** Shows the growth of accumulated savings and total capital over time.
- **Distribution:** Displays a pie chart showing the distribution between total savings and total interest earned.
- **Savings Rate:** Represents the annual savings rate in relation to the value of the generated interest each year. This visualization illustrates the development of both the savings rate and the generated interest over time. Additionally, it highlights the year when the generated interest surpasses the annual savings rate.
- **Normalized Values:** Displays the values of the savings rate and generated interests, both normalized based on the annual growth comprised of the savings rate and yearly interests. This provides a clearer perspective on how each component contributes to the overall growth each year.
- **Goals:** Displays the development of total capital and highlights specific milestones, such as when the capital doubles from the initial investment. It also indicates when the user-defined target value is achieved.
- **Values:** A table that provides a detailed breakdown of the capital at the beginning of the year, savings amount per year, generated interest per year, and capital at the end of the year.


# Run Locally

If you want to host the calculator yourself:
1. Clone this repository
```bash
git clone https://github.com/smichard/compound_interest_calculator.git
```

2. Navigate to the project directory:
```bash
cd compound_interest_calculator
```


3. Build the container image:
Run the following command to build a Docker image. Replace `my_app` with a name of your choice for the image.
```bash
podman build -t my_app -f Containerfile
```
This command will use the provided Containerfile to build an image named `my_app`. The process will install the necessary R packages and set up the environment for the Shiny app.

4. Run the Shiny app locally:

After building the image, you can run the Shiny app locally using the following command:
```bash
podman run --rm -p 3838:3838 my_app
```
This command will start a container from the `my_app` image and map port 3838 of the container to port 3838 of your local machine.

5. Access the Shiny app in a browser
Open a web browser and navigate to:
```bash
http://localhost:3838/
```
You should now see your Shiny app running!

# Summary
The Compound Interest Calculator helps bridge the gap between abstract formulas and practical insights. It turns the often-theoretical concept of compound growth into something tangible and interactive. By visualizing how capital evolves over time, it allows users to experiment with different savings rates, investment horizons, and interest assumptions — and to see immediately how these variables influence the trajectory of their capital.

Whether used for personal financial planning, educational purposes, or illustrating investment concepts, the tool provides a clear and structured way to explore “what-if” scenarios. It highlights key inflection points — such as when generated interest surpasses annual savings — making the dynamics of compounding easier to grasp and communicate.

Ultimately, the calculator is designed to make complex relationships between time, capital, and interest transparent, empowering users to make more informed, data-driven decisions about their long-term financial strategies.

# References
- YouTube Video - Nischa: Why Net Worth Skyrockets After $100K - [link](https://www.youtube.com/watch?v=F3Q-1W4QEVI)
- Web App - [link](https://compound-calculator.michard.io/)
- GitHub Repository - [link](https://github.com/smichard/compound_interest_calculator)