---
title: "Why Software Carbon Intensity Matters: An Introduction to the SCI Framework"
date: 2024-12-16
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Sustainability"]
tags: ["Sustainability","SCI","Carbon Intensity","Carbon Footprint"]

toc:
  enable: true
---

## Introduction
The digital revolution has transformed our world, but at what cost to our environment? Greenhouse gas (GHG) emissions from data centers have already surpassed those of the global airline industry and are expected to continue rising, highlighting the urgent need to address the carbon footprint of software. This article explores the Software Carbon Intensity (SCI) framework, an approach to measuring the environmental impact of software applications. The components of the SCI, its practical applications, and its role in enabling developers, architects, and organizations to create more sustainable software solutions will be explored.

## From Application to energy sourcing

Applications are deployed to fulfill specific business needs, and their operation requires careful consideration of availability, reliability, and efficiency. Decisions regarding high availability, backup solutions, and the geographic location of data centers significantly influence the environmental impact of software systems. The underlying infrastructure supporting these applications — comprising servers, storage, and networking components — consumes energy and resources not only during operational use but also throughout their production and manufacturing lifecycle.

The energy consumed for operating data centers is directly linked to the choices made in infrastructure deployment. Whether the hardware is utilized in an on-premises data center, a co-location facility, or within the public cloud, these decisions affect the overall energy demand and resource utilization. Furthermore, the origin of the electricity powering these systems plays a crucial role in determining their energy footprint and GHG emissions.

Understanding the comprehensive impact of these factors — ranging from application design to data center infrastructure and energy sourcing — allows for a detailed assessment of the energy and GHG footprint associated with software operations. This holistic view enables organizations to make informed decisions aimed at reducing their environmental impact.

{{< figure src="/images/posts/post_12_1.jpg" title="This diagram outlines the various components influencing the energy and greenhouse gas footprint of software operations, including applications, data center infrastructure, operational energy consumption, and energy utilities." >}}


## Introducing the Software Carbon Intensity Framework

To address the pressing need for measuring software's environmental impact, the Green Software Foundation (GSF) developed the **Software Carbon Intensity (SCI) framework**, now recognized as an ISO standard. The SCI framework provides a standardized method to calculate the carbon emissions associated with software applications, helping organizations quantify and reduce their environmental footprint.

Although the formula might appear complex at first glance, its components are straightforward:

- **E (Energy Consumption)**: The total energy used to operate the software.
- **I (Carbon Intensity of Energy Source)**: The amount of CO₂ emitted per kilowatt-hour during the generation of electricity.
- **M (Embodied Carbon)**: The CO₂ emissions resulting from manufacturing the hardware that runs the software.
- **R (Rate of Use)**: How the software scales—this could be per user, per API call, or any other relevant unit.

{{< figure src="/images/posts/post_12_2.jpg" title="Components of the Software Carbon Intensity (SCI) Framework" >}}

The SCI formula helps organizations derive a carbon footprint for their software applications by considering both operational and embodied emissions relative to their usage scale. It is important to recognize that the SCI framework is designed to monitor an application's environmental impact during its ongoing operation, rather than to compare different applications. Such comparisons would require standardized testing procedures and uniform hardware—conditions typically feasible only under controlled laboratory settings, which are unlikely in realistic, real-world scenarios.

The following image illustrates how the key metrics for calculating the SCI value can be derived:
{{< figure src="/images/posts/post_12_3.jpg" title="Deriving the Key Components of the Software Carbon Intensity Framework" >}}


## Why the SCI Framework Matters

Abhishek Gupta of Microsoft, Co-Chair of the SCI Specification Project, emphasizes the practical significance of the SCI framework: "The Software Carbon Intensity specification is exciting because it is a concrete manifestation of broad—and very important!—ideas of how we measure the carbon impacts of software systems. But, more importantly, it is about what we can do to mitigate those impacts," he explains.

By providing an actionable approach, the SCI framework empowers developers, architects, and organizations to make informed decisions that reduce carbon emissions. The framework focuses on the direct elimination of emissions by encouraging modifications to software systems that use less physical hardware, consume less energy, or leverage lower-carbon energy sources. Neutralization or avoidance offsets are not considered in reducing an SCI score, emphasizing the importance of tangible emission reductions. The SCI score offers a consistent and fair measure of a software system's carbon footprint, enhancing awareness and transparency of its sustainability credentials. This enables practitioners to set clear targets during development, make evidence-based decisions in design and deployment, and track progress over time.

By systematically applying the SCI framework across their application landscape, organizations can accurately compute the carbon intensity of their software systems. This comprehensive approach enables them to identify key areas where energy efficiency can be enhanced and empowers them to make informed decisions to reduce their overall environmental impact.

The GSF conducts its work openly, following open-source principles, with all discussions, meeting notes, and agenda items publicly accessible on their GitHub repository. This transparent approach allows anyone — not just GSF members — to contribute ideas and participate in discussions.

## Challenges and Moving Forward

One of the main challenges in adopting the SCI framework is obtaining accurate and granular data, particularly regarding energy consumption and embodied carbon. Collaboration with hardware manufacturers, data center operators, and energy providers is crucial to gather this information.

The GSF is actively working on case studies to demonstrate the SCI framework's application in real-world scenarios. These examples aim to refine the framework further and encourage widespread adoption.

## Conclusion

The SCI framework represents a significant step forward in promoting transparency by enabling organizations to monitor their software's carbon emissions. This standardized method for measuring and understanding the carbon footprint associated with software allows companies to see the tangible consequences of their actions. As a result, organizations can make informed decisions and take meaningful steps to reduce their environmental impact.

As our reliance on software continues to grow, integrating sustainability into software development is not just beneficial—it's imperative. The SCI framework offers a clear path for organizations committed to making a positive environmental difference.

A future blog post will explore practical methods for measuring and reducing the energy and carbon footprint of software applications, utilizing open-source tools and projects from the CNCF ecosystem.

## References

- Measuring greenhouse gas emissions in data centres: the environmental impact of cloud computing - [link](https://www.climatiq.io/blog/measure-greenhouse-gas-emissions-carbon-data-centres-cloud-computing)
- Software Carbon Intensity (SCI) Specification - [link](https://sci.greensoftware.foundation/)
- GitHub repository of the Green Software Foundation - [link](https://github.com/Green-Software-Foundation)
- Software Carbon Intensity (SCI) Specification Achieves ISO Standard Status, Advancing Green Software Development - [link](https://greensoftware.foundation/articles/sci-specification-achieves-iso-standard-status)
- Interview with the Co-Chairs of the SCI Specification Project - [link](https://greensoftware.foundation/articles/software-carbon-intensity-sci-specification-project)

_Note: All links were accessed and verified as of the date of this post._
