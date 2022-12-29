#!/bin/sh

docker build --no-cache --force-rm -t site .

docker run -p 8080:8080 site