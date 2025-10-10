---
title: "Compound Simulation – Exploring Portfolio Uncertainty"
date: 2025-11-22
draft: false
author: "Stephan Michard"
authorLink: "https://www.stephan.michard.io"
categories: ["Projects"]
tags: ["R", "Shiny", "Finance", "Monte Carlo"]
toc:
  enable: true
---

# Introduction
Financial planning is often built on a deterministic story: *“If I invest X € each month at 5 % per year, I’ll have Y € in 20 years.”* But real markets are anything but deterministic. Price fluctuations, volatility, and unexpected shocks can significantly change outcomes.

This new tool builds on the foundation of the [Compound Interest Calculator](https://michard.io/2025/compound-simulation-exploring-portfolio-uncertainty/), which takes a deterministic view of capital growth. This new tool introduces a probabilistic perspective by using Monte Carlo simulation to explore a spectrum of possible portfolio trajectories based on the users assumptions. Instead of a single projected curve, it generates a fan chart that visualizes uncertainty bands, the likelihood of reaching specific targets, and how sensitive outcomes are to your savings rate.

This is not a crystal ball. It’s a scenario explorer — a way to understand how uncertain markets shape financial trajectories.

You can try the web tool here:  
{{< button href="https://compound-simulation-139537757990.europe-north1.run.app/" >}}Open the Compound Simulation Tool{{< /button >}}

# What the Tool Does

The simulation is based on a small set of input parameters — initial capital, monthly contributions, expected return (μ), volatility (σ), investment horizon, and optionally a target value.

Using these assumptions, the app runs multiple simulation paths and provides:
- Fan chart of portfolio trajectories – median, expected path, and uncertainty bands (percentiles).
- Distribution of end values – showing the spread of possible outcomes at the horizon.
- Target probability – the likelihood of reaching (or exceeding) your goal.
- Stress test – a downside scenario with halved returns and doubled volatility.
- Savings elasticity – the effect on median outcomes from marginally increasing monthly contributions.

This shifts the focus from a single deterministic projection to a probabilistic view of potential futures.

# How to Use It Online

Running the hosted app is straightforward:

1. Open the simulation tool.

2. Enter your core parameters:
    - Initial Capital [€]
    - Monthly Savings [€]
    - Annual Return μ
    - Volatility σ
    - Time Horizon (years)
    - (Optional) Define a target and target date.
    - (Optional) Enable the Stress Test to explore adverse scenarios.
    - (Optional) Add a Savings Elasticity Increment (e.g. +€50/month) to assess sensitivity.

The output includes:
- A fan chart showing uncertainty over time.
- A distribution histogram of end values.
- A target probability indicator.
- A sensitivity summary for additional contributions.

# Run Locally

If you want to host or modify the simulation app yourself:

1. Clone the repository
```bash
git clone https://github.com/smichard/compound_simulation
```

2. Navigate to the project directory
```bash
cd compound_simulation
```

3. Build the container image
Run the following command to build an image named compound_simulation_app (or choose any name you prefer):
```bash
podman build -t compound_simulation_app -f Containerfile .
```

This command uses the provided Containerfile to set up the environment, including all required R packages for running the Shiny app.

4. Start the app locally
```bash
podman run --rm -p 3838:3838 compound_simulation_app
```
This launches a container and maps port 3838 inside the container to the same port on your host system.

5. Access the app in your browser
```bash
http://localhost:3838/
```
You should now see the Compound Simulation app running locally.

# Why This Matters

Uncertainty is real — any deterministic projection hides the range of plausible outcomes. Markets fluctuate, assumptions shift, and unexpected events can have a lasting impact. Probabilistic thinking helps make better decisions by accounting for both upside and downside scenarios instead of focusing on a single expected path.

- Goal probability provides a tangible measure: “What are the chances I’ll reach €X by year Y?”
- Savings elasticity reveals whether increasing contributions might be more effective than simply chasing higher returns.
- For investors, educators, or anyone exploring financial planning under uncertainty, this tool complements the [Compound Interest Calculator](https://michard.io/2025/compound-simulation-exploring-portfolio-uncertainty/) by adding a probabilistic layer to previously deterministic projections.

# Summary
Compound Simulation brings uncertainty to the forefront. By combining Monte Carlo simulation, sensitivity analysis, and clear visualizations, it highlights that financial projections aren’t fixed—they’re distributions. The tool helps explore not only expected growth but also the range of potential outcomes and their probabilities.

It can be used as a teaching aid, a scenario testing environment, or a personal planning companion. And since it’s open source, you can easily adapt it to your own assumptions, risk parameters, or visualization preferences.

# References
- Related Post – Compound Interest Calculator - [link](https://michard.io/2025/compound-simulation-exploring-portfolio-uncertainty/)
- Web App – [link](https://compound-simulation-139537757990.europe-north1.run.app/)
- GitHub Repository – [link](https://github.com/smichard/compound_simulation)
