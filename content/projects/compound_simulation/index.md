---
title: "Compound Simulation"
date: 2022-11-02T20:34:39Z
draft: false
summary: "A Shiny app that uses Monte Carlo simulation to show the full range of possible portfolio outcomes, not just one projection."
github: "https://github.com/smichard/compound_simulation"
weight: 6
---

Most financial projections tell a tidy, deterministic story: save this much at that rate and you end up with a specific sum in twenty years. Markets do not work that way. **Compound Simulation** is a Shiny app written in R that takes the probabilistic view instead, running a Monte Carlo simulation over many possible paths to show the spread of outcomes rather than one smooth curve.

You give it the usual inputs: initial capital, monthly contributions, an expected return and a volatility, and a time horizon. It returns a fan chart of trajectories with uncertainty bands, the distribution of end values, and the probability of reaching a target you define. Two extras keep it honest. A stress test halves returns and doubles volatility, and a savings-elasticity view shows whether putting a little more aside each month moves the outcome more than chasing a higher return.

It is the probabilistic companion to the deterministic [Compound Interest Calculator]({{< ref "/projects/compound_interest_calculator" >}}). The hosted app is linked below, and the full explanation of the model and its parameters is detailed in the blog post.

## References
- Blog Post - [link]({{< ref "/posts/post_16.md" >}})
- Web app - [link](https://compound-simulation.michard.io/)
- GitHub repository - [link](https://github.com/smichard/compound_simulation)
