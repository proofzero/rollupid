---
title: "Concepts"
description: "Understanding the Kubelt platform."
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

Kubelt is a platform for creating decentralized applications. We designed Kubelt to be a simple, easy to use, and secure platform for creating dApps.

With Kubelt, you can create dApps that interact with the blockchain and other decentralized services without the need of running infrastructure or custom server applications.

Your users also get the benefit of better security, privacy and experience without needing to download any new tools or apps.

## Design Principles

At Kubelt, we believe that the best way to create a dApp is to co-locate applications with the user and eliminate the need for infrastructure and server applications. After all, browsers and other clients are where the user's private cryptography is located and, like blockchains, are already decentralized.

We call this the **local-first** approach to building applications and it's a good way to ensure that your dApp is secure, private, and easy to use. All you need is a service layer to coordinate with the blockchain and other decentralized services. The user's cyrptography provides the necessary features to [turn any browser or client into a user peer in a peer-to-peer network]({{<relref "cms-whitepaper">}}).

In other words, if you think of a [dApp as a wallet]({{<relref "01-hello-world" >}}) with storage, messaging, and other features, Kubelt provides the necessary APIs to make this coordination possible with as little as one line of code.
z`
## The Kubelt Star Platform

<img src="/images/logicalarch.png" width="{{ .Width }}" height="{{ .Height }}">

[todo]:
principles:
- handle the repeated patterns
- standardization / adoption (acknowledgement of the blockchain)
- unification of services, chains/identity (embrace)
- extensibility / composability (open source and proprietary - there are always exceptions)
- open source libraries and SDK
- unification

--- 


<!-- At the heart of Kubelt is the **"Kubelt Core"**, an application container designed to look and feel like a supercharged Web3 wallet.

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

Kubelt will also always try to deliver and publish content over available decentralized networks like IPFS and fall back to HTTP gatways when needed. -->

## Showcase

See what others have build with Kubelt. [Showcase →]({{< relref "/showcase/" >}})

## Contributing

Find out how to contribute to Kubelt. [Contributing →]({{< relref "contributing" >}})

## Resources

- Get started with our [quick start]({{< relref "quick-start" >}}) guide.
- Read our [whitepaper]({{< relref "cms-whitepaper" >}}) to learn more.
- Check out our [SDK Reference](#) docs.
- FAQ and troubleshooting in our [help]({{< relref "help" >}}) section.
