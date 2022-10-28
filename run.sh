#!/bin/sh

docker build -t site .  

docker run -p 8080:80 site