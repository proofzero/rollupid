![kubelt banner](https://kubelt.com/images/kubelt-banner.gif)

# Kubelt Decentralizes Applications

![Build](https://github.com/kubelt/kubelt/actions/workflows/next.yaml/badge.svg)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)
![Version badge](https://img.shields.io/badge/Version-pre%20alpha-orange.svg)

Kubelt’s integrated peer-to-peer edge architecture decentralizes any application. The Kubelt network is made of wallet-centric “Kubelt Cores” that look and behave any crypto wallets with the addition of content enabled APIs. These cores are configurable and composable in infinite ways with other peers on the network to create decentralized applications that fit your use case.

For more please see the [Kubelt Docs](https://kubelt.com/docs).

## Kubelt Monorepo Tour

Let's take a look around at the Kubelt Monorepo layout...

### SDK

The [src/](src/) directory contains the Kubelt SDK source code. The Kubelt SDK is written in Clojurescript and use to build the Kubelt client libraries and tools.

### Packages

The [packages/](packages/) directory contains package configuration for the things we release to package repository sites like [npm](https://npmjs.com). The current target packages are:

- [Kubelt JS](packages/sdk-js): Kubelt library targeted for node.
- [Kubelt Web](packages/sdk-web): Kubelt library targeted for browser.
- [Kubelt CLJ](packages/sdk-clj): Kubelt library targeted for Clojure.
- [Kubelt CLJS](packages/sdk-clj): Kubelt library targeted for Clojurescript.
- [IPFS JS](packages/ipfs-js): Kubelt utility library for working with IPFS.
- [Kubelt CLI](packages/kbt): Kubelt command line tool.
- [Kubelt Debug CLI](packages/ddt): Kubelt debug command line tool.

### Website / Docs

The [www/](www/) directory contains the Kubelt.com static website documentation portal.

### dApp

The [dapp/](dapp/) directory contains a web application for interacting with Kubelt as a customer.

### Browser Extension

The [ext/](ext/) directory contains an experimental browser extension.

### Tooling / Scripts

The Kubelt monorepo tooling configuration and scripts:

- [bb/](bb/) directory contains some build tooling for use with [babashka](https://babashka.org).
- [bzl/](bzl/) directory contains miscellaneous tooling for [Bazel](https://bazel.build/), one of the build tools that we use.

### Other

- [rdf/](rdf/) directory contains various RDF vocabularies, examples, and data fixtures used during development.
- [fix/](fix/) directory contains fixture data for testing.

## Develop

### Configuration

Please use the following tools and versions when developing with this repository:

- Node.js v17+
- Java SDK v8+
- Babashaka 0.7.x

#### NIX ENV

Install NIX and run `nix-build` to install nix packages and `nix-shell` create a nix shell with a fully configured development environment.

### Build

Run `bb run test:all:develop` to make sure everything is setup correctly. Then use `bb tasks` to see what other build and test tasks are available.

## Contributing

We are happy to accept contributions of all sized. Feel free to submit a pull request.

Also checkout our [contributing guidelines](https://kubelt.com/docs).
