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

\

**Three Problems With web3**

In January, [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html), raising issues fundamental to the future of web3 infrastructure.

Moxie made some good points; for example, that people will never run their servers. For most users, the convenience of centralized services far outweighs any known or unknown trade-offs in data privacy.

The "three tiered", client-server-database application, has proven to be the best architecture for delivering applications quickly and securely. However, as a team of senior engineers, we would like to point out that this pattern of building applications has created three distinct and very current problems.

**User Problem: Data Silos**

Overtime, as more of these APIs came online, developers began to accrue _your_ valuable data in their respective data silos.

This creates a power dynamic between user and developer over control and distribution of data, as the only way to access this data is to integrate with or consume their services.

**Developer Problem: Integration Headaches**

As you integrate more and more API services into your application you end up with middleware and service providers that you need to maintain.

You are forced to conform to their service layers in exchange for _"cheap and easy"_ infrastructure.
 
**Business Problem: Platform Risk**

Similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter), all of this sounds great _until it's not_. As your application scales with your success, so do your costs. Now you are stuck with the surprise fees for compute and egress, eating away at your bottom line.

<!--With this context in mind, let's discuss Each of these problems are deserving of their own blog post. For As a team building a part of the decentralized future, here's our take.-->

### The Right Protocol for the Right Problem

<!--<img src="/images/right_protocol.png" width="{{ .Width }}" height="{{ .Height }}">-->

How can we achieve the same developer experience in a decentralized protocol while avoiding the problems listed above? Is it possible to completely decentralize the middle tier? 

Blockchain seems like a good answer, and for many use cases, this is true! Defi, NFT, and other transactional use cases that require a **consensus** on a state transitions make great sense for blockchains. For these cases, the fees associated with smart contracts provide an acceptable cost in return for a better developer and user experience, along with increased trust, security, and transparency.

Most applications, however, do not benefit from a blockchain in the same way. Almost all applications could benefit from a **"decentralized middle tier"** where application logic, content, and general configurations are served by an **eventually consistent protocol**.

### Decentralizing the Middle Tier

<!--<img src="/images/content_is_everything.png" width="{{ .Width }}" height="{{ .Height }}">-->

**Local-first**, decentralized applications use a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) to serve their content without the need for centralized server farms. Content is addressed using **content addresses** which are immutable and backed by [Filecoin](ipns://filecoin.io/) for redundancy. 

**Kubelt Cores** provide Compute, cryptography, identity and many other services, and use IPFS to store and deliver content. 

### Wallet are the Key(s)

<!--<img src="/images/user_application.png" width="{{ .Width }}" height="{{ .Height }}">-->

Your wallet is your key to unlock your **Kubelt Core**. This acts as the entry point to all your local-first applications, and simplifies the developer stack while maintaining:

🔑 Better privacy \
🔑 Better costs \
🔑 Better control


### Kubelt Cores

A Kubelt Core is a fully generalized and decentralized backend that can run apps and interact with other Kubelt Cores. 

Kubelt Cores coordinate compute and distributed storage for your local-first applications. Your wallet is the entry point into the Kubelt platform, and unlocks your **private core**. Applications can access your identity, content, messaging and more by interacting with your Kubelt Core. You don't need to install any new software or make new identities, just log into your Kubelt Core with your existing wallet to get started. 

Developers can create add-ons for Kubelt Cores, extending their capabilities and interoperability. 

### What's Next?

<img src="/images/enter_kubelt.png" width="{{ .Width }}" height="{{ .Height }}">

Kubelt is building a more extensive, better, user-centric web. If you like what we're doing and want to learn more, follow us on **[Twitter](https://twitter.com/kubelt)** and join us on **[Discord](https://discord.gg/UgwAsJf6C5)**.

Also take a look at our [docs]({{< relref "introduction" >}}) for more information. For **early access** [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of the decentralized web, together!
