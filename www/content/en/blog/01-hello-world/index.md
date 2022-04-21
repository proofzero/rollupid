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

In January, [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html), raising issues fundamental to the future of web3 infrastructure.

Moxie argued that people will never run their servers, and we tend to agree. For most users, the convenience of centralized services far outweighs any known or otherwise unknown trade-offs in data privacy.

As a team of engineers with over two decades of experience, we tend to agree. The "three tiered", client-server-database application, has proven to be the best architecture for delivering applications quickly and securely. This application architecture however, went through it's own evolution and growing pains.

The first generation of this architecture was to conveniently co-locate state and compute inside large databases or stateful application. This introduced the problem of errors introduced by application logic causing casacading incorrect state changes and scaling problems -- arguably similar to blockchains and smart contracts today.

To improve on this, developers began to migrate application logic out of the large stateful applications into a small stateless APIs by building the tools and frameworks that conveniently abstracted away databases and pushed more work onto clients so, developers could iterate on their use case quickly in the middle of clients and database.

However, this pattern of building applications has created three distinct and very current problems.

**User Problem: Data Silos**

Overtime, as more of these APIs came online, developers began to accrue _your_ valuable data in their respective data silos.

This creates a power dynamic between user and developer over control and distribution of data, as the only way to access this data is to integrate with or consume their services.

**Business Problem: Integration Headaches**

As you integrate more and more API services into your application you end up with many point-to-point connections that you need to maintain.

This increase in complexity produces eventually slows down developement by increasing the cost change management (and any compliance or governance related activities).

**Developer Problem: Platform Risk**

Later on, centralized cloud platforms emerged and began to offer services that abastracted away common infrastructure patterns and systems forcing developers to conform to their service layers in exchange for _"cheap and easy"_ infrastructure.

However, similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter), all of this sounds great _until it's not_. As your application scales with your success, so do your cost and you're left with little means of re-platforming. Now you are stuck with the surprise compute and egress fees eating away at your bottom line, and the pressure is on.

<!--With this context in mind, let's discuss Each of these problems are deserving of their own blog post. For As a team building a part of the decentralized future, here's our take.-->

### The Right Protocol for the Right Problem

<!--<img src="/images/right_protocol.png" width="{{ .Width }}" height="{{ .Height }}">-->

Given that abstractions around co-location of data and compute makes for a better developer experience, how can we think differently and apply this idea in a **decentralized protocol** and still get **similar results without the long tail trade-offs?**

Blockchain seems like the obvious answer and, for many use cases, is true! Defi, NFT, and other transactional use cases that require a **consensus** on a state transitions make great sense for blockchains. For these cases, smart contracts and the associated fees provide an acceptable cost in DX and UX for increased trust, security, and transparency.

This cost and trade-off in experience for developers and users however, is not acceptable for the balance and majority of use cases. Application logic, content, and general configurations change much more quickly and would better suit an **eventually consistent protocol** better.

It is, after all, the eventually consistent use case that makes up the bulk of all applications we use today and is where the team at Kubelt did much of our thinking about how to develop a **"decentralized middle tier"**.

### Decentralizing the Middle Tier

<!--<img src="/images/content_is_everything.png" width="{{ .Width }}" height="{{ .Height }}">-->

To truly decentralize an application, you also need to decentralize the application content itself. As we already discussed, most blockchains aren't great for this, except for [Filecoin](ipns://filecoin.io/). You can't run a blockchain on the client _(http gateway required)_, so a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) is just as important.

When backing IPFS with Filecoin, all content is available through a decentralized network encoded as immutable **content addresses**. These addresses can pack anything from JSON documents to SQLite databases, WASM, and more -- you pick! You are also breaking problems down to a size that a client can handle at the edge where you can now pick and choose from an ecosystem of **open source tools, libraries and abstractions.**.

These same content addresses can also pack and fully encrypt signatures, schemas, versions, and more, **collapsing APIs into a fully decentralized protocol** simplifying the traditional three-tier application architecture and **solving all three problems** listed above in one fell swoop.

This isn't to be underestimated. It pushes almost the entire application to the client, meaning developers can also think about novel applications over a fully generalized, distributed API surface with a simplified identity protocol meaning, **the user is the entry node into the network.**

### Wallet are the Key(s)

<!--<img src="/images/user_application.png" width="{{ .Width }}" height="{{ .Height }}">-->

When you push the entire application to the edge we're now able to co-locate everything with the user, in a **local-first** application where the problems are also **user sized**. This local-first application model simplifies the developer stack while maintaining:

🔑 Better privacy \
🔑 Better costs \
🔑 Better control

However, all of this is easier said than done! So, we decided to look around and see if any work in this area has been attempted in the past? What we found was an evolution ready to pop!

Starting from the early days of the Message Object Model (SmallTalk, Corba) and the more recent State Actor Model (Erlang, Akka), we finally realized the answer we were looking for was right in front of us, **Wallets**! With crypto wallets, developers could have ubiquitous access to:

🤯 Local-first user cryptography \
🤯 Messaging APIs \
🤯 Blockchains

All that's missing is content management for data and compute!

### Kubelt Cores

When combining capacity, availability, and distribution (IPFS + Filecoin) with _wallets_, we can now discuss a fully generalized protocol that is convenient and useful for application development. This is because wallets are ubiquitous across multiple platforms. We can use them to ensure access to content and capabilities are correctly governed in a way that is at par or better than centralized services.

For Kubelt, the wallet is the entry point into the network, which, unlike other platforms, eliminates the need to install any new software or create new identities. Instead, we form a **"private core"** that keeps your cryptography local but adds an always available API that developers can access for identity, content, messaging, and more. And that's only the beginning of what cores can offer.

Kubelt isn't built just for Web3. A Kubelt Core is a fully generalized backend that can break down data silos and simplify integrations, all user permissioned and private. For instance, with Kubelt, your bank can generate content addresses containing your banking information using your favorite accounting software's public key permissioned by you or, in a similar way, even host and permission your health care records.

It doesn't stop there either. Kubelt developers and users can provide single or multi-signing Kubelt cores that can be laid out in configurations that gate and or commercialize access to public or protected content. These configurations are significant for SaaS applications, DAOs, and more.

The possibilities are virtually endless.

### What's Next?

<img src="/images/enter_kubelt.png" width="{{ .Width }}" height="{{ .Height }}">

Kubelt is building a more extensive, better, user-centric web. If you like what we're doing and want to learn more, follow us on **[Twitter](https://twitter.com/kubelt)** and join us on **[Discord](https://discord.gg/UgwAsJf6C5)**.

Also take a look at our [docs]({{< relref "introduction" >}}) for more information. For **early access** [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of the decentralized web, together!
