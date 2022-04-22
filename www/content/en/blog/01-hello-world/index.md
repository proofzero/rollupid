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

Moxie made some good points; for example, that people will never run their own servers. For most developers the convenience of centralized services far outweighs any trade-offs in cost or user privacy.

As a team of senior engineers, we tend to agree with Moxie. The centralized "three tiered" (client-server-database) application has proved to be the best architecture for delivering applications quickly and securely. This application architecture, however, went through it's own evolution and growing pains.

The first generation of this architecture conveniently co-located state and compute inside large databases via stored procedures, or stateful backend applications. This introduced the problem of errors in application logic causing casacading faulty state changes and scaling problems. These are very similar to the problems we've seen with blockchains and smart contracts today.

Developers addressed these weaknesses by migrating application logic out of these large, stateful applications into small, stateless APIs. They built tools and frameworks that abstracted away databases and pushed work to different layers of the application stack. By solving the right problem in the right application tier developers were able to organize and iterate on their work.

However, this pattern of building applications created three distinct, immediate problems.

**User Problem: Data Silos**

As more of these cloud-backed APIs came online, cloud providers began to accumulate _your_ valuable data in their respective data silos.

This creates a unfavorable power dynamic with cloud providers. The only way developers can access their user data is to integrate with, consume services owned by, and pay, big cloud providers. The only alternatives are... other cloud providers.

**Business Problem: Integration Headaches**

As Paul Graham wrote, [99.5% of code is glue](https://paul-graham.com/weird/). As you integrate more and more API services into your application you end up with middleware and service providers that you need to maintain.

This increase in complexity produces eventually slows down developement by increasing the cost of a change (and any compliance or governance related activities).

**Developer Problem: Platform Risk**

Centralized cloud platforms emerged and began to offer services that abastracted away common infrastructure patterns and systems, forcing developers to conform to their service layers in exchange for _"cheap and easy"_ infrastructure.

However, similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter), all of this sounds great _until it's not_. As your application scales with your success, so do your costs. Now you're left with little means of re-platforming and are stuck with surprise compute and egress fees eating away at your bottom line.

### The Right Protocol for the Right Problem

<img src="/images/right_protocol.png" width="{{ .Width }}" height="{{ .Height }}">

The question we're answering at Kubelt is: how can we completely decentralize the middle tier? How can we make developer experience 10x better by giving people the familiarity of a centralized architecture without all of the associated complexity, problems, and costs? 

**What about blockchain?** Blockchain seems like a good answer for decentralization, and has many important use cases: Defi, NFTs, and any other use cases that require a **consensus** on state transitions. For these cases, smart contracts and the associated fees and transaction times provide an acceptable cost in DX and UX for increased trust, security, and transparency.

But blockchains are ledgers, a data structure typically more suited to backend development rather than the middle tier. The cost, speed, and usability tradeoffs of a decentralized backend only make sense for a handful of applications. Almost all applications could benefit from a **"decentralized middle tier"** where application logic, content, configuration are served by a **decentralized, **eventually consistent protocol**.

### Decentralizing the Middle Tier

<img src="/images/decentralize_middle.png" width="{{ .Width }}" height="{{ .Height }}">

To truly decentralize an application you need to decentralize APIs. A blockchain generally can't run on the client, which means a centralized _(HTTP gateway is required)_; but a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) _can_ run on clients.

With IPFS, backed by Filecoin, all content is available through a decentralized network encoded as immutable **content addresses**. These addresses can pack anything from JSON documents to SQLite databases, WASM, and more -- you pick! By using content addresses, you break problems down to a size that a client can handle at the edge. Now you can pick and choose from an ecosystem of **open source tools, libraries and abstractions** to solve small, simple problems.

These same content addresses can also pack and fully encrypt signatures, schemas, versions, and more, **collapsing APIs into a fully decentralized protocol** simplifying the traditional three-tier application architecture and **solving all three problems** listed above in one fell swoop.

This isn't to be underestimated. When the entire application to pushed to the client, developers can begin to think about novel applications over a fully generalized, **local-first**, distributed API surface.

### Wallet(s) are the Key(s)

A **local-first** application, where problems are **user sized**, and content and compute are co-located, simplifies the developer experience while adding:

🔑 Better privacy \
🔑 Better costs \
🔑 Better control

However, all of this is easier said than done! We're still missing a big piece of the puzzle, **trust and identity**. Fortunately for us, the answer we were looking for was right in front of us, **Wallets**! With crypto wallets, developers have ubiquitous access to:

🤯 Local-first user cryptography \
🤯 Messaging APIs \
🤯 Blockchain Smart Contracts & Payments

All we need to do now is put it all together!

### Enter Kubelt Cores

<img src="/images/enter_kubelt.png" width="{{ .Width }}" height="{{ .Height }}">

A Kubelt Core bundles decentralized protocols and other capabilties into a **fully generalized and configurable backend** that bootstraps your local-first applications.

Your wallet is the entry point into the network. When you unlock your private core it extends your wallet into a local-first application. With your private core you can send and receive encrypted messages, store content, create local-first applications, and create more cores.

You don't need to install any new software or make new identities, you just log in with your existing wallet and claim your core.

### What's Next?

Kubelt is building a better, more user-centric web. If you like the sound of that and want to learn more, follow us on **[Twitter](https://twitter.com/kubelt)** and join us on **[Discord](https://discord.gg/UgwAsJf6C5)**.

Take a look at our [docs]({{< relref "introduction" >}}) for more information. For **early access** [get in touch](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) and tell us about your use case.

Let's build the future of the decentralized web, together!
