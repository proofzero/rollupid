![kubelt banner](https://kubelt.com/images/kubelt-banner.gif)

# Kubelt Decentralizes Applications

![Build](https://img.shields.io/github/checks-status/kubelt/kubelt/main)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)
![Status badge](https://img.shields.io/badge/Status-pre%20alpha-orange.svg)

Kubelt’s integrated peer-to-peer edge architecture decentralizes any application. The Kubelt network is made of wallet-centric “Kubelt Cores” that look and behave any crypto wallets with the addition of content enabled APIs. These cores are configurable and composable in infinite ways with other peers on the network to create decentralized applications that fit your use case.

For more please see the [Kubelt Docs](https://kubelt.com/docs).

## Kubelt Monorepo Tour

Let's take a look around at the Kubelt Monorepo layout...

### SDK

The [/src](src/) directory contains the Kubelt SDK source code. The Kubelt SDK is written in Clojurescript and use to build the Kubelt client libraries and tools.

## Packages

The [packages/](packages/) directory contains package configuration for the things we release to package repository sites like [npm](https://npmjs.com). The current target packages are:

- [Kubelt JS](packages/sdk-js): Kubelt library targeted for node.
- [Kubelt Web](packages/sdk-web): Kubelt library targeted for browser.
- [Kubelt CLJ](packages/sdk-clj): Kubelt library targeted for Clojure.
- [Kubelt CLJS](packages/sdk-clj): Kubelt library targeted for Clojurescript.
- [IPFS JS](packages/ipfs-js): Kubelt utility library for working with IPFS.
- [Kubelt CLI](packages/kbt): Kubelt command line tool.
- [Kubelt Debug CLI](packages/ddt): Kubelt debug command line tool.
- [Sanity.io Plugin](packages/sanity-plugin-kubelt): Kubelt Plugin for Sanity.io CMS.

## Website / Docs

The [www/](www/) directory contains the Kubelt.com static website documentation portal.

## dApp

The [dapp/](dapp/) directory contains a web application for interacting with Kubelt as a customer.

### Browser Extension

The [ext/](ext/) directory contains an experimental browser extension.

### Tooling

### bb

The [bb/](bb/) directory contains some build tooling for use with [babashka](https://babashka.org).

### bzl

The [bzl/](bzl/) directory contains miscellaneous tooling for [Bazel](https://bazel.build/), one of the build tools that we use.

## Other

### rdf

The [rdf/](rdf/) directory contains various RDF vocabularies, examples, and data fixtures used during development.

### fix

The [fix/](fix/) directory contains fixture data for testing.

## Configuration

If you use [nvm](https://github.com/creationix/nvm/) to manage your local node versions, you can set up the supported version by running:

```shell
$ nvm use
```

Otherwise, please install the version of node indicated in `.nvmrc` using your preferred method.
