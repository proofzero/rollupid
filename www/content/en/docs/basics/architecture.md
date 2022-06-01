---
title: "Architecture"
description: "Kubelt decentralizes applications."
lead: "Kubelt decentralizes applications."
date: 2020-10-06T08:48:45+00:00
lastmod: 2020-10-06T08:48:45+00:00
draft: false
images: []
menu:
  docs:
    parent: "basics"
weight: 102
toc: true
---

## Concepts

Kubelt decentralizes any application by integrating with local wallet cryptography and backing every blockchain account with standardized decentralized services over a integrated peer-to-peer edge platform.

In doing so, the platform provides a unified API for all dApps to interact with each other and the blockchain. This allows for a decentralized application ecosystem to be built around a single, unified, and secure platform using local cryptography and decentralized storage, content delivery and messaging.

**[insert logically local wallet diagram here plus binding into startships with a single API]**

# Architecture

**[insert architecture diagram here]**

## Kubelt Cores

At the heart of Kubelt is the **"Kubelt Core"**, an application container designed to look and feel like a supercharged Web3 wallet.

The Kubelt Core extends standard wallet APIs with multi-signer, content management, and networking capabilities. These capabilities can be configured and organized into decentralized applications. Kubelt provides several libraries, tools and applications to work with and manage cores.

In essence, Kubelt Cores turn user wallets into stand-alone, local-first, edge applications that can be composed in a peer-to-peer configuration, unlocking endless possibilities.

### Collaboration

Kubelt uses existing wallet accounts as an entrypoint to the network. By signing into our application, a private Kubelt Core that matches your wallet address is created (or retrieved from) the network.

This Kubelt Core is private in the sense that it can only have one signer that matches the address of the Kubelt Core.

Within your private Kubelt Core you can begin to create or authenticate yourself into other Kubelt Cores (imagine having multiple pairs of 👓 that you can wear to switch between identities). These other Kubelt Cores can be configured with multiple signers in different roles (for example, `developer`, `contract`, `designer`). Now you've got collaborative, wallet-aware applications.

Multi-signer Kubelt Cores can expose different network capabilities such as content management APIs, web sockets, web RTC brokering, and more.

### Content Management

Every Kubelt Core has content management APIs for publishing and retrieving content. Cores can be configured to make content available to users through our network, through IPFS, or through traditional HTTP gateways.

Any type of content can be packed into the Kubelt Cores. For instance, you can publish simple images, documents, any other static content, user databases, WASM functions, JSON blobs, even raw data structures. All content uses a content addressed naming system to ensure compatability with decentralized content routing networks like IPFS.

Kubelt Cores can be used in endless ways and composed to together to create arbitrarily complex applications.

### Composability

Kubelt Cores are desigined to be super flexible in configuration and usage. Cores can be arranged to support any application you can imagine.

A simple example would be to create a multi-signer core for you organization, called `@acmecorp`, that is a gateway to several "`@widget`" cores. The `@acmecorp` core can then be configured with a CNAME to expose it over HTTP so that the `@widget` cores are easily queried: `api.kubelt.com/@0x123abc/@0x456xyz` becomes `widgets.acme.org/@widget`.

A similar configuration can be used so that if `@acmecorp` is a SaaS-like or blockchain application with it's own users. Cores can be created per-user and configured on-the-fly. For example, a `@acmecorp/@<user wallet address>` core can be used to store private user data or `@acmecorp/@<smart contract>` core can be used to gate access to, for example, NFT content.

By using content addresses as the primary naming convention, content can created, signed, and exchanged between cores to solve complex business problems in simple, novel ways. Imagine creating cores that authorize the creation of a content address to your bank account, encrypted with a third-party's public key (e.g. QuickBooks), for easy and better Open Banking.

### Extensibility

Kubelt Cores are a decentralized application framework. This framework is intended to be open source so that users can self-host their own peer-to-peer infrastructure and extend standard APIs with their own custom logic.

Join our community to stay up to date. [Discord →](https://discord.gg/UgwAsJf6C5)

### Local-first

Kubelt is local-first by default in order to provide a full-stack local developer experience. This makes sure that that Kubelt applications are user-centric and decentralized.

Kubelt will also always try to deliver and publish content over available decentralized networks like IPFS and fall back to HTTP gatways when needed.

## Showcase

See what others have build with Kubelt. [Showcase →]({{< relref "/showcase/" >}})

## Contributing

Find out how to contribute to Kubelt. [Contributing →]({{< relref "contributing" >}})

## Resources

- Get started with our [quick start]({{< relref "quick-start" >}}) guide.
- Read our [whitepaper]({{< relref "cms-whitepaper" >}}) to learn more.
- Check out our [SDK Reference](#) docs.
- FAQ and troubleshooting in our [help]({{< relref "help" >}}) section.
