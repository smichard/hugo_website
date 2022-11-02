#!/bin/sh

docker build -t site .  

docker run -p 8080:8080 site