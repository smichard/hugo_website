---
title: "Matrix and element"
date: 2023-02-20T20:27:00+01:00
draft: true
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["category"]
tags: ["tag-1","tag-2","tag-3"]
---

[ ] boilerplate code, dateien in Ordner data löschen
[ ] Dockerfile psw. mit env ersetzen

# Introduction

# Notice

{{< notice warning >}}
No production use
{{< /notice >}}

# Tools

- Traefik
- Synapse
- element

# Code

create virtual machine
```
gcloud compute instances create matrix --project=<my_project> --zone=europe-west3-a --machine-type=n2-standard-2  --tags=http-server,https-server --create-disk=auto-delete=yes,boot=yes,device-name=matrix,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20230107,mode=rw,size=20,type=projects/matrix-898032/zones/europe-west3-a/diskTypes/pd-balanced --no-shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring --reservation-affinity=any 
```
{{< notice warning >}}
cost approx. 75 $ / month
{{< /notice >}}


install docker and docker compose
```
apt update
apt install -y docker.io docker-compose
```

add user to group
```
usermod -aG docker $USER
```
reconnect to VM
test docker
```
docker run hello-world
```

clone repository
```
git clone https://gitlab.com/smichard/cloud_setup
cd cloud_setup
```

set env variables in compose file:
```
CF_API_EMAIL=
CF_DNS_API_TOKEN=
url
```

```
touch acme.json
chmod 600 acme.json
```

point DNS entry to external url

Create docker network:
```
docker network create proxy
```

adjust element config file  
Create Element configuration file in ´./data/element-config.json´:
adjust:  
"base_url": "https://matrix.euredomain.de",
"server_name": "matrix.euredomain.de"


create synapse configuration file
Generate ´./data/matrix/homeserver.yaml´ configuration file for synapse:

get path 
```
cd /data/messenger/matrix
pwd
```

```
docker run -it --rm \
    -v "/home/stephan_michard/cloud_setup/data/messenger/matrix:/data" \
    -e SYNAPSE_SERVER_NAME=matrix.web.michard.cc \
    -e SYNAPSE_REPORT_STATS=yes \
    matrixdotorg/synapse:latest generate
```

continue:


Adjust the ´homeserver.yml´ file:
remove:
```
database:
  name: sqlite3
  args:
    database: /data/homserver.db
```

replace with:
```
database:
  name: psycopg2
  args:
    user: synapse
    password: sicheres Kennwort
    database: synapse
    host: matrix-db
    cp_min: 5
    cp_max: 10
```

append to homeserver.yaml
```
enable_registration: true
enable_registration_without_verification: true
```

Spin up Matrix and Element:
```
cd element_local
docker-compose up -d
```

Create a user:
```
docker exec -it matrix /bin/bash
register_new_matrix_user -c /data/homeserver.yaml http://localhost:8008
```


# Summary
{{< figure src="/images/posts/test_image.jpg" title="test caption" >}}

# References
- synapse.org
- element
- techno tim
- matthew houdgson
- goNeuland.de Documentation (german) - [link](- Hugo Documentation - [link](https://gohugo.io/))