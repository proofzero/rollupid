![kubelt banner](https://kubelt.com/images/kubelt-banner.gif)

# Kubelt Decentralizes Applications

![Build](https://img.shields.io/github/checks-status/kubelt/kubelt/main)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)

Kubelt’s integrated peer-to-peer edge architecture decentralizes any application. The Kubelt network is made of wallet-centric “Kubelt Cores” that look and behave any crypto wallets with the addition of content enabled APIs. These cores are configurable and composable in infinite ways with other peers on the network to create decentralized applications that fit your use case.

>  ![Status badge](https://img.shields.io/badge/Status-pre%20alpha-red.svg)

For more please see the [Kubelt Docs](https://kubelt.com/docs).


## Kubelt Monorepo

This repository contains the following:

### SDK

The [/src](src/) directory contains the Kubelt SDK source code. The Kubelt SDK is written in Clojurescript and use to build the Kubelt client libraries and tools.


## develop

If you use [nvm](https://github.com/creationix/nvm/) to manage your local node versions, you can set up the supported version by running:

```shell
$ nvm use
```

Otherwise, please install the version of node indicated in `.nvmrc` using your preferred method.

## tour

Let's take a look around. These are the top-level directories in the repository:

### bb

The [bb/](bb/) directory contains some build tooling for use with [babashka](https://babashka.org).

### bzl

The [bzl/](bzl/) directory contains miscellaneous tooling for [Bazel](https://bazel.build/), one of the build tools that we use.

### dapp

The [dapp/](dapp/) directory contains a web application for interacting with Kubelt as a customer.

### docs

The [docs/](docs/) directory contains the static documentation website.

### ext

The [ext/](ext/) directory contains an experimental browser extension.

### fix

The [fix/](fix/) directory contains fixture data.

### packages

The [packages/](packages/) directory contains package configuration for the things we release to package repository sites like [npm](https://npmjs.com).

### rdf

The [rdf/](rdf/) directory contains various RDF vocabularies, examples, and data fixtures used during development.

### src/main

The [src/main/](src/main/) directory contains source code for various libraries and applications.

### src/test

The [src/test/](src/test/) directory contains various tests corresponding to the contents of [src/main](src/main).
