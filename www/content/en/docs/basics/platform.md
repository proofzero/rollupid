---
title: "Platform"
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

We call this the **local-first** approach to building applications and it's a good way to ensure that your dApp is secure, private, and easy to use. All you need is a service layer to coordinate with the blockchain and other decentralized services. The user's cryptography provides the necessary features to turn any browser or client into a peer within a peer-to-peer network.

In other words, if you think of a dApp as a graph node with storage, messaging, and other features, Kubelt provides the necessary APIs to make this coordination possible with as little as one line of code.

## How it works

The Kubelt platform is powered by a suite of services that can be configured and extended to support your dApp. You can use our Kubelt CLI or our no-code configuration experience called [✨Starbase]().


<img src="/images/logicalarch.png">
<a href="/images/logicalarch.png">click here for larger image</a>
<br />
<br />

These services are accessible through [🌌 Stargate](), a unified RPC provider gateway, dedicated to your dApp. Stargate composes your favorite providers like Alchemy, Infura, Quick Node and others together with our standardized, local-first [storage](), [messaging](), and more in a application container we call [🚀 Starship Apps]().

Kubelt takes care of the coordination and orchestration of these services for you so you can focus on your user experience. You can use the same libraries and APIs as you would with any other dApp or you can use our Open Source libraries and SDK for faster development.

By configuring a Kubelt your dApp also gets access to better identity and auth features with [3ID](https://threeid.xyz). These features include better security through MFA and simplifed user accounts that bridge your user's blockchain accounts into a single user profile.

In addition to all of this, Kubelt applications also get access to features like decentralized content delivery through [Orbit CDN]().

## Showcase

See what others have build with Kubelt. [Showcase →]({{< relref "/showcase/" >}})

## Contributing

Find out how to contribute to Kubelt. [Contributing →]({{< relref "contributing" >}})

## Resources

- Get started with [3ID]({{< relref "3ID" >}}).
- Check out our [SDK Reference](#) docs.
- FAQ and troubleshooting in our [help]({{< relref "help" >}}) section.
