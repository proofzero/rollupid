# kubelt

![Build](https://github.com/kubelt/kubelt/actions/workflows/next/badge.svg)
![License](https://img.shields.io/github/license/kubelt/kubelt?label=Apache%202.0)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)

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
