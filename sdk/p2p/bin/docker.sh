#!/bin/bash
#
# p2p/bin/docker.sh

version=0.1.3

bin/release.sh

docker build -t "kubelt-p2p:${version}" .
