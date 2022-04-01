# kubelt SDK

![Build](https://img.shields.io/github/checks-status/kubelt/kubelt/main?style=for-the-batch)
![License](https://img.shields.io/github/license/kubelt/kubelt?style=for-the-badge)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord&style=for-the-badge)](https://discord.gg/m8NbsgByA9)

## prerequisites

You should have the latest [LTS version](https://nodejs.org/en/download/) of [Node.js](https://nodejs.org) installed.

You should have the latest release of [IPFS](https://ipfs.io/#install) installed.

You should have a web browser installed. We test against:

- Firefox
- Chrome

## develop

Begin by installing the necessary tooling:

```console
$ npm install
```

Build the development CLI:

```console
$ npm run build:cli:develop
```

Link the CLI so that it may be run globally:

```console
$ npm link .
```

After this step is complete you should be able to run `ddt` and see help output. This is a CLI developed in conjunction with the SDK to exercise and validate the SDK, as well as to make it easy to run various development-time operations.

### linting

Initialize the linter (optional):

```console
$ npm run lint:init
```

While optional, performing this initialization step may reduce linting times for large code bases.

Lint all source code:

```console
$ npm run lint:all
```

To lint just the SDK development utility code, run target `lint:dev`.

To lint just the SDK source code, run target `lint:main`.

To lint just the SDK test code, run target `lint:test`.

### clojurescript

The SDK may be used as a native dependency in ClojureScript projects.

For users of `deps.edn`:

```clojure
{com.kubelt/sdk {:mvn/version "x.x.x"}}
```

For users of `lein` | `shadow-cljs`:

```clojure
[com.kubelt/sdk "x.x.x"]
```

#### usage

Require the SDK:

```clojure
(:require [com.kubelt.sdk.v1 :as sdk])
```

Initialize a specific version:

```clojure
(def kbt (sdk/init {...})
```

Call some of the available API methods:

```clojure
(kbt/do-something)
```

Clean-up when you're finished:

```clojure
(sdk/halt kbt)
```

### node.js

#### build

To compile the development version of the SDK as a Node.js library:

```console
$ npm run build:sdk:node:develop
```

#### release

To compile the release version of the SDK as a Node.js library:

```console
$ npm run build:sdk:node:release
```

#### test

To compile the tests for execution in Node.js:

```console
$ npm run test:sdk:node
```

The tests are configured to run automatically when compilation completes, but may also be run separately:

```console
$ node target/node-test.js
```

The SDK exposes a JavaScript API that should be tested separately:

```console
$ npm run test:sdk:js
```

### web

#### build

To compile the development version of the SDK for use in a browser:

```console
$ npm run build:sdk:web:develop
```

#### release

To compile the release version of the SDK for use in a browser:

```console
$ npm run build:sdk:web:release
```

#### test

To compile the tests for execution in a web browser:

```console
$ npm run test:sdk:web
```

#### usage

TODO

## references

### libraries

- [js-multiformats](https://github.com/multiformats/js-multiformats) - multiformat-related interfaces and building blocks

### formats

- [CARv1](https://ipld.io/specs/transport/car/carv1/) - Content ARchive v1 format
- [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) - JSON-based serialization for Linked Data
