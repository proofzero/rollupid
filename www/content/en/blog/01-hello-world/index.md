---
title: "Kubelt's Approach to a Decentralization"
description: "A bigger, better, user-centric web."
lead: "A bigger, better, user-centric web."
date: 2022-04-05T14:25:35-04:00
lastmod: 2022-04-05T14:25:35-04:00
weight: 50
images: ["kubelt.png"]
draft: false
contributors: ["@alfl", "@maurerbot"]
---

<img src="/images/kubelt-banner.gif" width="{{ .Width }}" height="{{ .Height }}">

### A Brief Recap

In January, [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html), raising issues fundamental to the future of web3 infrastructure.

Moxie made some good points; for example, that people will never run their servers. For most users, the convenience of centralized services far outweighs any known or unknown trade-offs in data privacy.

As a team of senior engineers, we tend to agree with Moxie. The "three tiered", client-server-database application, has proven to be the best architecture for delivering applications quickly and securely. This application architecture however, went through it's own evolution and growing pains.

The first generation of this architecture was to conveniently co-locate state and compute inside large databases or stateful application. This introduced the problem of errors introduced by application logic causing casacading incorrect state changes and scaling problems -- arguably similar to blockchains and smart contracts today.

To improve on this, developers began to migrate application logic out of the large stateful applications into a small stateless APIs by building the tools and frameworks that conveniently abstracted away databases and pushed more work onto clients so, developers could iterate on their use case quickly in the middle of clients and database.

However, this pattern of building applications has created three distinct and very current problems.

**User Problem: Data Silos**

Overtime, as more of these APIs came online, developers began to accrue _your_ valuable data in their respective data silos.

This creates a power dynamic between user and developer over control and distribution of data, as the only way to access this data is to integrate with or consume their services.

**Business Problem: Integration Headaches**

As you integrate more and more API services into your application you end up with middleware and service providers that you need to maintain.

This increase in complexity produces eventually slows down developement by increasing the cost change management (and any compliance or governance related activities).

**Developer Problem: Platform Risk**

Later on, centralized cloud platforms emerged and began to offer services that abastracted away common infrastructure patterns and systems forcing developers to conform to their service layers in exchange for _"cheap and easy"_ infrastructure.

However, similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter), all of this sounds great _until it's not_. As your application scales with your success, so do your costs. Now you're left with little means of re-platforming and are stuck with the surprise compute and egress fees eating away at your bottom line.

<!--With this context in mind, let's discuss Each of these problems are deserving of their own blog post. For As a team building a part of the decentralized future, here's our take.-->

### The Right Protocol for the Right Problem

<!--<img src="/images/right_protocol.png" width="{{ .Width }}" height="{{ .Height }}">-->

At Kubelt, we set out to answer, how can we achieve the same developer experience in a decentralized protocol while avoiding the problems listed above? Is it possible to completely decentralize the middle tier?

Blockchain seems like a good answer and, for many use cases, is true! Defi, NFT, and other transactional use cases that require a **consensus** on a state transitions make great sense for blockchains. For these cases, smart contracts and the associated fees provide an acceptable cost in DX and UX for increased trust, security, and transparency.

Most applications, however, do not benefit from a blockchain in the same way. Almost all applications could benefit from a **"decentralized middle tier"** where application logic, content, and general configurations are served by an **eventually consistent protocol**.

### Decentralizing the Middle Tier

<!--<img src="/images/content_is_everything.png" width="{{ .Width }}" height="{{ .Height }}">-->

To truly decentralize an application, you also need to decentralize the APIs. A blockchain generally can't run on the client, which means a centralized _(http gateway is required)_; but a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) can.

With IPFS, backed by Filecoin, all content is available through a decentralized network encoded as immutable **content addresses**. These addresses can pack anything from JSON documents to SQLite databases, WASM, and more -- you pick! By using content addresses, you are also breaking problems down to a size that a client can handle at the edge where you can now pick and choose from an ecosystem of **open source tools, libraries and abstractions.**.

These same content addresses can also pack and fully encrypt signatures, schemas, versions, and more, **collapsing APIs into a fully decentralized protocol** simplifying the traditional three-tier application architecture and **solving all three problems** listed above in one fell swoop.

This isn't to be underestimated. When the entire application to pushed to the client, developers can begin to think about novel applications over a fully generalized, **local-first**, distributed API surface.

### Wallet are the Key(s)

<!--<img src="/images/user_application.png" width="{{ .Width }}" height="{{ .Height }}">-->

A **local-first** application, where problems are **user sized**, content and compute is co-located again, simplifying the developer experience while maintaining:

🔑 Better privacy \
🔑 Better costs \
🔑 Better control

However, all of this is easier said than done! We're still missing a big piece of the puzzle, **trust and identity**. Fortunately for us, the answer we were looking for was right in front of us, **Wallets**! With crypto wallets, developers could have ubiquitous access to:

🤯 Local-first user cryptography \
🤯 Messaging APIs \
🤯 Blockchain Smart Contracts & Payments

All we need to do now is put it all together!

### Enter Kubelt Cores

A Kubelt Core bundles decentralized protocols and other capabilties into a **fully generalized and configurable backend** that bootstraps your local-first applications.

Your wallet is the entry point into the network, and unlocks your private core, extending your wallet into a local-first application. With your private Core you can receive and send encrypted messages as well as configure and permission new cores for more local-first applications.

You don't need to install any new software or make new identities, just log into your Kubelt Core with your existing wallet to claim your core.

### What's Next?

<img src="/images/enter_kubelt.png" width="{{ .Width }}" height="{{ .Height }}">

Kubelt is building a more extensive, better, user-centric web. If you like what we're doing and want to learn more, follow us on **[Twitter](https://twitter.com/kubelt)** and join us on **[Discord](https://discord.gg/UgwAsJf6C5)**.

Also take a look at our [docs]({{< relref "introduction" >}}) for more information. For **early access** [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of the decentralized web, together!
