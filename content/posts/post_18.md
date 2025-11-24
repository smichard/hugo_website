---
title: "My Homelab: A Traefik-centered Self-hosting Setup"
date: 2026-01-24
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Homelab"]
tags: ["homelab","container","self-hosting"]
toc:
  enable: true
---

{{< figure src="/images/posts/homelab.png" title="Summary of Homelab services - AI generated" >}}

# Introduction

Several years ago, I began building a small homelab with two primary objectives in mind: gaining hands-on experience with containers and modern application deployment, and running selected services locally to avoid storing certain data in public cloud environments. In hindsight, this environment evolved into a solid foundation for a local AI stack as well, which I now operate alongside the rest of my setup and will detail in a future post. Although the focus here is on a homelab, the technical stack described can be deployed just as easily in any cloud environment; all that is required is a virtual machine running a Linux distribution of your choice and a container engine.
    
What began as an experiment has turned into a stable setup that I use every day. At the center of this setup is Traefik, which handles all incoming HTTP and HTTPS traffic and lets me access every service over SSL with clean domains like _service-name.home.example.com_ instead of a collection of raw IP addresses and ports.

In this post I will walk through how I structure this homelab, explain how Traefik ties everything together, and outline a selection of the services currently running in my lab.

# Hardware and base platform

The homelab does not run on high-end servers. Most of the hosts are refurbished x86 thin clients with the following specifications:
- 16 to 32 GB of RAM per node
- A modest amount of storage for container images, configuration files, and selected data
- Low power consumption, which is important for a system that runs 24/7

The environment uses CentOS Stream 9 as the operating system. On top of that, I run Docker and Docker Compose. Nearly every component in the homelab is containerized, with Traefik positioned in front of these containers as a reverse proxy and routing layer.

# Architecture overview

At a high level, the architecture looks like this:
- Several containers run on the hosts.
- A dedicated container network called `external`, where Traefik and all services that are exposed to the home network reside.
- An internal DNS setup and a private domain, such as `home.example.com`, where services are exposed as subdomains like:
    - _https://pihole.home.example.com_
    - _https://ntfy.home.example.com_ 

Clients on the home network resolve these hostnames to the internal IP address of the homelab host, ensuring that traffic remains entirely within the local network. The local DNS server is automatically assigned to clients connected to the internal network, making all services immediately accessible to any device on the same network.  
Traefik acts as the single entry point for HTTP and HTTPS. It terminates TLS, routes requests to the appropriate container based on the hostname, and applies middlewares such as redirects and authentication where required.


# Traefik as the center of the homelab

Traefik is an open-source reverse proxy and edge router that integrates well with containerized environments. It monitors the container socket, automatically discovers running containers, and uses labels defined on those containers to configure routing.

In my setup, Traefik provides three main benefits:

1. Automatic TLS for everything  
    Traefik uses the DNS challenge with my DNS provider to request certificates from Let’s Encrypt. I can issue a wildcard certificate for `*.home.example.com`, so every internal service gets proper HTTPS without having to manage individual certificates.
2. Clean hostnames instead of ports  
    Every service gets its own subdomain, such as `pihole.home.example.com` or `ntfy.home.example.com`. This means I do not have to remember that one service is on port 8080, another on 9090, and so on.
3. Centralized routing and security  
    Since everything goes through Traefik, I can:
    - Redirect all HTTP traffic to HTTPS.
    - Protect specific endpoints with basic auth or other middleware.
    - Inspect and debug routes using the Traefik dashboard.
        

## Traefik Docker Compose configuration

Here is a simplified version of the Traefik `docker-compose.yml` I use:
```YAML
version: "3"

services:
  traefik:
    image: traefik:latest
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - external
    ports:
      - 80:80
      - 443:443
    environment:
      - CF_API_EMAIL=${CF_API_EMAIL}
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN}
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data/traefik.yml:/traefik.yml:ro
      - ./data/acme.json:/acme.json
      - ./data/config.yml:/config.yml:ro
    labels:
      - "traefik.enable=true"

      # HTTP router for Traefik dashboard
      - "traefik.http.routers.traefik.entrypoints=http"
      - "traefik.http.routers.traefik.rule=Host(`traefik.home.example.com`)"

      # Redirect HTTP to HTTPS
      - "traefik.http.middlewares.traefik-https-redirect.redirectscheme.scheme=https"
      - "traefik.http.middlewares.sslheader.headers.customrequestheaders.X-Forwarded-Proto=https"
      - "traefik.http.routers.traefik.middlewares=traefik-https-redirect"

      # Basic auth for the secure dashboard
      - "traefik.http.middlewares.traefik-auth.basicauth.users=user:hashed-password"

      # HTTPS router for Traefik dashboard
      - "traefik.http.routers.traefik-secure.entrypoints=https"
      - "traefik.http.routers.traefik-secure.rule=Host(`traefik.home.example.com`)"
      - "traefik.http.routers.traefik-secure.middlewares=traefik-auth"
      - "traefik.http.routers.traefik-secure.tls=true"
      - "traefik.http.routers.traefik-secure.tls.certresolver=cloudflare"
      - "traefik.http.routers.traefik-secure.tls.domains[0].main=home.example.com"
      - "traefik.http.routers.traefik-secure.tls.domains[0].sans=*.home.example.com"
      - "traefik.http.routers.traefik-secure.service=api@internal"

networks:
  external:
    external: true
```

The important ideas are:

- Traefik listens on ports 80 and 443 and is connected to the `external` network.
- It uses environment variables to access the DNS provider so it can request certificates from Let’s Encrypt.
- The dashboard is exposed at `https://traefik.home.example.com`, protected by basic auth.
- The TLS configuration issues a wildcard certificate for `*.home.example.com`.
    

Other services join the same `external` network and define their own labels, for example:

```YAML
services:
  ntfy:
    image: binwiederhier/ntfy
    networks:
      - external
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ntfy.entrypoints=https"
      - "traefik.http.routers.ntfy.rule=Host(`ntfy.home.example.com`)"
      - "traefik.http.routers.ntfy.tls.certresolver=cloudflare"
```

With this pattern, every service becomes available over HTTPS under its own subdomain without additional manual configuration in Traefik.

# Core services in my homelab

On top of Traefik, I run a set of core services that provide DNS, monitoring, automation, messaging, logging, and secrets management. The key components are:
- **Pi-hole – DNS:** Provides network-wide DNS resolution and ad-blocking, and handles internal DNS for homelab hostnames such as `*.home.example.com`. Blocking unwanted domains for devices on the network.
- **Mafl – Dashboard:** A minimalistic and flexible homepage for organizing service links, grouping categories, and providing quick navigation. Mafl can perform health checks on linked services, is configured through a simple YAML file, and offers a Progressive Web App for mobile devices. Since each service sits behind Traefik with its own hostname, Mafl serves as a curated entry point to the entire environment.
- **Ntfy – Messaging / Pub-Sub:** A lightweight HTTP-based publish/subscribe notification service used for event-driven messaging across the environment. Typical use cases include sending alerts when backups complete and receiving notifications when containers restart unexpectedly. Ntfy provides mobile and desktop apps, allowing access from phones and laptops both inside and outside the home network, depending on firewall and VPN settings.
- **Doozle – Container Logs:** A simple web-based UI for viewing Docker logs in real time. Logs are accessible through a browser, it is possible to filter by container, and tail logs as they update. This is particularly useful when testing new services or debugging automation workflows.
- **Beszel – Resource Monitoring:** A lightweight monitoring tool for tracking system metrics and container statistics across multiple machines. It provides CPU, memory, and disk usage insights, making it easy to identify overloaded or misbehaving nodes and maintain visibility into the health of thin clients and other devices.
- **Uptime Kuma – Service Monitoring:** A dashboard for monitoring the availability of both internal and external services. It checks defined endpoints, as well as public websites and APIs. If a service becomes unreachable, Uptime Kuma sends alerts, e.g. via Ntfy or other services, providing an early warning system for issues in the homelab.
- **n8n – Automation Engine:** A workflow automation platform used to orchestrate tasks, trigger scripts or containers, and integrate events across services. Typical use cases include reacting to webhooks or scheduled triggers, executing scripts or container actions, and sending notifications through Ntfy when certain conditions are met. Instead of implementing automation logic in custom code, workflows can be modeled visually and integrated directly with containers and external services.
- **Vaultwarden – Secrets Management:** A self-hosted Bitwarden-compatible server for securely managing passwords and sensitive information within the homelab. It stores credentials and secrets for services and accounts, enables secure sharing across devices.
    

# Conclusion

What began as a simple playground for learning containers and avoiding public cloud services for certain use cases has evolved into a practical, resilient platform for running everyday services at home. Centering the setup around Traefik, standardizing on containerized services, and using a wildcard domain with automated TLS have kept the architecture both manageable and extensible. The use of modest, low-power refurbished thin clients has also proven effective in keeping costs and energy consumption low while still offering sufficient resources.

Over time, the homelab has also turned out to be a solid foundation for hosting local AI services, content of a future post. Depending on the criticality of individual services and one’s tolerance for risk, it can be worthwhile to distribute components across independent hosts, monitor services across nodes, or run certain workloads in parallel for redundancy. It is equally important to think carefully about backups to avoid losing data or configurations during failures or experiments. That said, this remains a homelab project rather than a production environment governed by strict service-level agreements; temporary outages are acceptable, and part of the experimentation process.

With these principles such as simple routing, consistent domains and TLS, lightweight hardware, and containerized services, one can build a flexible environment that supports DNS, monitoring, automation, messaging, secrets management, and more, tailored to one's own needs.

# References

- CentOS Stream - [link](https://www.centos.org/)
- Traefik - reverse proxy - [link](https://github.com/traefik/traefik)
- Pi-hole - network-wide ad blocking and DNS - [link](https://github.com/pi-hole/pi-hole)
- Mafl - dashboard for homelab services  - [link](https://github.com/hywax/mafl)
- ntfy - publish/subscribe push notifications  - [link](https://github.com/binwiederhier/ntfy)
- n8n - workflow automation - [link](https://github.com/n8n-io/n8n)
- Vaultwarden - Bitwarden-compatible server - [link](https://github.com/dani-garcia/vaultwarden)
- Beszel - resource monitoring for multiple clients - [link](https://github.com/henrygd/beszel)
- Youtube Video -  Techno Tim: Put Wildcard Certificates and SSL on EVERYTHING - [link](https://www.youtube.com/watch?v=liV3c9m_OX8)  
    
