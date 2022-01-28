# k8s/Dockerfile
#
# WIP - currently broken

# TODO build the image with Bazel instead?
#FROM debian:stretch-slim AS builder

# TODO use slimmer base image
# TODO install specific version of @kubelt/p2p

FROM node:lts-buster

RUN apt-get update && apt-get install libsystemd-dev

WORKDIR /usr/src/p2p

RUN chown node:node ./
USER node

# Default to building for production.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY index.js ./

RUN npm install

# Copy stuff from builder image.
#COPY --from=builder /foo ./foo

CMD ["node", "index.js"]
