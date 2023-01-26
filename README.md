![kubelt-banner](https://user-images.githubusercontent.com/695698/198127215-272ee281-6a3c-49f9-8ca1-ebe0b07f249a.gif)

# Simple & Secure ‍User Identity

![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/UgwAsJf6C5)

#### Build Status

##### Platform

![](https://github.com/kubelt/kubelt/actions/workflows/main-galaxy.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-edges.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-starbase.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-access.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-address.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-account.yaml/badge.svg)

##### Apps

![](https://github.com/kubelt/kubelt/actions/workflows/main-profile.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-console.yaml/badge.svg)
![](https://github.com/kubelt/kubelt/actions/workflows/main-passport.yaml/badge.svg)

##### Services

![](https://github.com/kubelt/kubelt/actions/workflows/main-images.yaml/badge.svg)

##### Packages

TODO

## What is Kubelt?

Kubelt secures user profiles into private, decentralized identities called 3IDs. With the 0xAuth protocol, applications get to know their customers better and stay in touch with access to rich user profiles, content, services and more.

With Kubelt, users are in control of aggregating their data and connections across multiple identity solutions, creating a secure environment for developers to access rich user data.

This repository hosts Kubelt's libraries, client source code and documentation.

To learn more please see the [Kubelt Docs](https://developers.kubelt.com).

## Kubelt Monorepo Tour

Let's take a look around at the Kubelt Monorepo layout...

## Platform

The [platform/](platform) directory is where all the core identity services are located. The Kubelt platform is organized by "local-first" (or logically local) nodes (accounts, address, account, and more) organized in a graph by the Galaxy service.

## Services

The [services/](services) directory is supporting services for the platform are developed.

## Apps

The [apps/](apps) directory is where the presentation layer applications (or backend for frontends) live. These apps include the 3ID user experience as well as the Developer Console app.

## Projects

The [projects/](projects) directory is where non-core applications live such as the PFP generation service and more.

## Smart Contracts

The [smartcontracts/](smartcontracts/) directory contains all of our smart contract code.

## Packages

The [packages/](packages/) directory contains our libraries and other share components.

### Website / Docs

The [docs/](docs/) directory contains the developer documentation portal.

## Develop

### Configuration

Please use the following tools and versions when developing with this repository:

- Node.js v17+

#### NIX ENV

Install NIX and run `nix-build` to install nix packages and `nix-shell` to execute a shell with a fully configured development environment.

Note that docker doesn't fully work using nix packages.

#### Developing

This monorepo is managed by Yarn workspaces and nested workspaces. You can run `yarn` commands (i.e., `yarn dev`) to run all the platform services and dependencies together. Applications require more resources so it is recommended to run them individually.

## Contributing

We are happy to accept contributions of all sized. Feel free to submit a pull request.

Also checkout our [contributing guidelines](https://kubelt.com/docs).
