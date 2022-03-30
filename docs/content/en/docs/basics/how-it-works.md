---
title: "How it works"
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

## Kubelt Cores

At the heart of Kubelt is the **"Kubelt Core"**, an application container designed to look and feel just like a supercharged Web3 wallet.

The Kubelt Core extends the standard wallet APIs with multi-signer, content, and networking capabilities. These capabilities can be configured and organized in a way to build decentralized applications. Kubelt provides several libraries, tools and applications to work with and manage cores.

In essence, Kubelt Cores turns every user is a stand-alone, local-first, edge application that can be composed in a peer-to-peer configuration, unlocking endless possibilities.

### Collaboration

Kubelt uses your existing wallet accounts as your entrypoint to the network. By signing into our application, a restricted Kubelt Core that matches your wallet address will be created or retrieved from the network. This Kubelt Core is restricted in the sense that it can only have one signer that matches the address of the Kubelt Core.

Within your restricted Kubelt Core context you can begin to create or authenticate yourself into other Kubelt Core contexts (imagine having multiple pairs of 👓 that you can wear). These other Kubelt Cores can be configured with multiple signers assigned various role based access controls. In doing so, you've now enabled collaboration applications that are wallet-aware.

Multi-signer Kubelt Cores can expose different network capabilities such as content management APIs, web sockets, web RTC brokering, and more.

### Content Management

Every Kubelt Core is enabled with content management APIs for publishing and retrieving content and can be configured to be accessible through traditinoal API gateways or with our libraries and tools.

Any type of content can be packed into the Kubelt Cores. For instance, you can publish simple images, documents, and other static content or you can publish user databases, wasm compute, CRDTs, and even semantic graphs. All content also uses a content addresses naming system to ensure compatability with decentralized content networks like IPFS.

Kubelt Cores can be utilized in endless ways and even composed to together to create more complex applications.

### Composability

Kubelt Cores are desigined to be super flexible in configuration and usage. In other words, a core in physical space is just a core but in logical space, these cores can be arranged to behave in any desired way.

A simple example would be to create a multi-signer "organization core" called `@acmecorp` that is a gatekeeper to several "`@widget`" cores. The `@acmecorp` gating core can then be configured with a CNAME to expose it over http so that the `@widget` cores are easily queried. By doing so, `api.kubelt.com/@0x123abc/@0x456xyz` becomes `widgets.acme.org/@widget`.

A similar configuration can be used so that if `@acmecorp` is a SaaS-like or blockchain application with it's own users, "user cores" can be created and configured on the fly. For example, a `@acmecorp/@<user wallet address>` core can be used to private user content or `@acmecorp/@<smart contract>` core can be used to gate access to NFT content.

Lastly, by using content addresses as the primary naming convention, content can created, signed, and exchanged between cores to solve complex business problems in novel yet simple ways. Imagine creating cores that authorize the creation of a content address to your bank account encrypted to a third-party's public key (e.g. QuickBooks) for easy and better Open Banking.

### Extendability

We are building Kubelt Cores as a decentralized application framework. This framework is intended to be open sourced when stable so that users can self-host and extend standard APIs in a peer-to-peer configuration.

Join our community to stay up to date. [Discord →](https://discord.gg/UgwAsJf6C5)

### Local-first

- IPFS

## Showcase

See what others have build with Kubelt. [Showcase →]({{< relref "showcase" >}})

## Contributing

Find out how to contribute to Kubelt. [Contributing →]({{< relref "contributing" >}})

## Resources

- Get started with our [quick start]({{< relref "quick-start" >}}) guide.
- Read our [whitepaper]({{< relref "whitepaper" >}}) to learn more.
- Check out our [SDK Reference]({{< relref "JS#kubelt-cores" >}}) docs.
- FAQ and troubleshooting in our [help]({{< relref "help" >}}) section.
