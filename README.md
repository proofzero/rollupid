![kubelt-banner](https://user-images.githubusercontent.com/695698/198127215-272ee281-6a3c-49f9-8ca1-ebe0b07f249a.gif)

# Simple & Secure ‍User Identity

![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/UgwAsJf6C5)
![Version badge](https://img.shields.io/badge/Version-pre%20alpha-orange.svg)

#### Build Status
![](https://github.com/kubelt/kubelt/actions/workflows/main-galaxy.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-oort.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-threeid.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-console.yaml/badge.svg)

## What is Kubelt?

Kubelt secures user profiles into private, decentralized identities called 3IDs. With the 0xAuth protocol, applications get to know their customers better and stay in touch with access to rich user profiles, content, services and more.

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

The [projects/edeem/](projects/redeem/) directory contains a web application for minting 3ID invites.

### Icons

The [projects/icons/](projects/icons/) directory contains a simple service for generating signed URLs for image upload.

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
