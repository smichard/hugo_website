#!/bin/sh

podman build --arch=arm64 --no-cache --force-rm -t site .

podman run -p 8080:8080 site