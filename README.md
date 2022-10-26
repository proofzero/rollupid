![kubelt banner](https://kubelt.com/images/kubelt-banner.gif)

# Kubelt

## Simple & Secure ‍User Identity

![Build](https://github.com/kubelt/kubelt/actions/workflows/next.yaml/badge.svg)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/UgwAsJf6C5)
![Version badge](https://img.shields.io/badge/Version-pre%20alpha-orange.svg)

Kubelt is a decentralized identity provider that connects users and developers together in a secure, private, and engaging decentralized protocol.

With Kubelt, users are in control of aggregating their data and connections across multiple identity solutions, creating a secure environment for developers to access rich user data.

This repository hosts Kubelt's libraries, client source code and documentation.

To learn more please see the [Kubelt Docs](https://developers.kubelt.com).

## Kubelt Monorepo Tour

Let's take a look around at the Kubelt Monorepo layout...

### Galaxy

The [projects/galaxy/](projects/galaxy/) directory contains our GraphQL server and schemas for stitching together logically decentralized services.

### 3ID

The [projects/threeid/](projects/threeid/) directory contains an Remix React Web application. 3ID is an opt-in service that providers users a super-charged “gravatar”-like service that gives users control and privacy over their application data and p2p messaging and more. For more information visit [3ID](https://threeid.xyz).

### Starbase

The [starbase/](starbase/) directory contains a web application for interacting with Kubelt and setting up applications on the platform.

### Smart Contracts

The [smartcontracts/](smartcontracts/) directory contains all of our smart contract code.

### Packages

The [packages/](packages/) directory contains package configuration for the things we release to package repository sites like [npm](https://npmjs.com). The current target packages are:

### Website / Docs

The [www/](www/) directory contains the Kubelt.com static website documentation portal.

### Redeem

THe [projects/edeem/](projects/redeem/) directory contains a web application for minting 3ID invites.

## Develop

### Configuration

Please use the following tools and versions when developing with this repository:

- Node.js v17+

#### NIX ENV

Install NIX and run `nix-build` to install nix packages and `nix-shell` to execute a shell with a fully configured development environment.

Note that docker doesn't fully work using nix packages.

## Contributing

We are happy to accept contributions of all sized. Feel free to submit a pull request.

Also checkout our [contributing guidelines](https://kubelt.com/docs).
