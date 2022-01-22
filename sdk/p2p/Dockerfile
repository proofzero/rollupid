# sdk/p2p/Dockerfile

# TODO build the image with Bazel instead
#FROM debian:stretch-slim AS builder

FROM node:lts-buster

RUN apt-get update && apt-get install libsystemd-dev

# Default to building for production.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /opt

COPY package.json package-lock.json index.js ./

RUN npm install

CMD ["node", "index.js"]
