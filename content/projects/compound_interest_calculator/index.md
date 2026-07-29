---
title: "Compound Interest Calculator"
date: 2022-11-02T20:34:39Z
draft: false
summary: "A Shiny app that charts how capital grows over time under different savings and interest assumptions."
github: "https://github.com/smichard/compound_interest_calculator"
weight: 5
---

Compound interest is simple as a formula and surprisingly hard to feel. The relationship between how much you save, the rate you earn, and the number of years you stay invested rarely matches intuition. The **Compound Interest Calculator** is a Shiny app written in R I built to make that relationship visible. Enter a savings rate, an interest assumption, and a time horizon, and it charts how the capital develops year by year.

It goes past a single number. The app compares scenarios, marks milestones such as the year annual interest starts to exceed what you contribute, and breaks the result down across several charts and a detailed table. The idea came from a video about why the first €100,000 is the hardest part of building wealth. I wanted something I could actually experiment with rather than just watch.

You can open the hosted version directly, or run it locally as a container. The full description of every parameter and chart is on the blog.

## References
- Blog Post - [link]({{< ref "/posts/post_15.md" >}})
- Web app - [link](https://compound-calculator.michard.io/)
- GitHub repository - [link](https://github.com/smichard/compound_interest_calculator)
