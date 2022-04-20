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

The same convenience of centralized platforms applied to developers seems true when looking at the significant uptake in platforms like Infura and OpenSea. Moxie himself claims **centralized platforms** permit faster innovation than **decentralized protocols**, ignoring any associated risks, but is this a valid comparison?

**Platforms** and **protocols** are two very different categories. The former is generally built on the latter, introducing opinionated technologies and services. Platforms force developers to conform applications to their opinions -- the more applications conform to platform opinions, the stickier they become and therefore applications are exposed to greater risk of exploitation.

But what if you could push opinionation to the edge? How could that improve outcomes and experience for both developer and user?

As a team building a part of the decentralized future, here's our take.

### The Centralization Success Trap

<img src="/images/success_trap.png" width="{{ .Width }}" height="{{ .Height }}">

A major selling point of centralization is the convenience of data aggregation and co-location of compute. When data and compute are co-located developing applications becomes very straight forward (more on that later). The more abstract the relationship between data and compute, the easier it is to create secure applications.

Platforms provide abstractions through hyper-opinionated services **in the middle**. As confirmed by Moxie, this is a massive advantage for applications in the early stages of development as fewer resources are required to innovate. But what's the catch?

Similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter), all of this sounds great _until it's not_. As your application scales with your success, the cost of these choices begin to show their fangs, leaving you with little means of re-platforming. Now you are stuck with the surprise compute and egress fees eating away at your bottom line, and the pressure is on.

Instead, what you want is a system that allows developers to enjoy the benefits of the decentralized model without any of the operational overhead and contingency planning for hyperbolic growth.

### The Right Protocol for the Right Problem

<!--<img src="/images/right_protocol.png" width="{{ .Width }}" height="{{ .Height }}">-->

Supposing abstractions around co-location of data and compute makes for a better developer experience, how can we think differently and apply this idea in a **decentralized platform** and still get **similar results without the trade-offs?**

Blockchain seems like the obvious answer, and we agree this is true for many use cases involving **trusted state transitions**. Defi, NFT, and other transactional use cases that require a consensus on state make great sense for blockchains! For these cases, smart contracts and the associated fees provide an acceptable cost in DX and UX for increased trust, security, and transparency.

This cost and trade-off in experience for developers and users however, is not acceptable for the majority of use cases. Application logic, content, and general configurations change much more quickly and would suit an **eventually consistent** protocol better.

It is, after all, the eventually consistent use case that makes up the bulk of all applications we see today and is where the team at Kubelt did much of our thinking about how to develop a **"decentralized middle tier"**.

### The User is the Application

<!--<img src="/images/user_application.png" width="{{ .Width }}" height="{{ .Height }}">-->

We started thinking that if blockchains and clients are already decentralized, could we push all the opinions out to the user at the edge?

In doing so, we should be able to co-locate everything with the user and take advantage of a local-first application model using user cryptography and ubiquitous runtimes. When the problem is **user sized**, developers can use their favorite tools and libraries, simplifying their stack while maintaining:

✅ Better privacy \
✅ Better costs \
✅ Better control

However, all of this is easier said than done! So, we decided to look around and see if any work in this area has been attempted in the past? What we found was an evolution ready to pop!

Starting from the early days of the Message Object Model (SmallTalk, Corba) and the more recent State Actor Model (Erlang, Akka), we finally realized the answer we were looking for was right in front of us, **Wallets**! With crypto wallets, developers could have ubiquitous access to:

🤯 Local-first user cryptography \
🤯 Messaging APIs \
🤯 Blockchains

All that's missing is content management for data and compute!

### Content is Everything

<!--<img src="/images/content_is_everything.png" width="{{ .Width }}" height="{{ .Height }}">-->

To truly decentralize an application, you also need to decentralize the application content itself. As we already discussed, most blockchains aren't great for this, except for [Filecoin](ipns://filecoin.io/). You can't run a blockchain on the client, so a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) is just as important.

When backing IPFS with Filecoin, all content is available through a decentralized network encoded as immutable **content addresses**. These addresses can pack anything from JSON documents to SQLite databases, WASM, and more -- you pick! You are also breaking problems down to a size that a client can handle at the edge where you can now **"bring your own opinions."**

With that said, you can already take advantage of an existing **ecosystem** of **open-source**, client-side libraries, frameworks and tools which can continue to grow and flourish independently of any service. Take the work being done by [Ink and Switch](https://www.inkandswitch.com/), for example, which is solving for distributed conflict-free replicated data types (CRDTs).

These same content addresses can also pack and fully encrypt signatures, schemas, versions, and more, collapsing APIs into a fully decentralized protocol simplifying the traditional three-tier application architecture. This isn't to be underestimated. It pushes almost the entire application to the client, meaning developers can create **novel applications** and their own user experiences on a uniform, distributed API surface permissioned by the end-user.

### Permissioning = Better Outcomes for Everyone

When combining capacity, availability, and distribution (IPFS + Filecoin) with _wallets_, we can now discuss a fully generalized protocol that is convenient and useful for application development. This is because wallets are ubiquitous across multiple platforms. We can use them to ensure access to content and capabilities are correctly governed in a way that is at par or better than centralized services.

For Kubelt, the wallet is the entry point into the network, which, unlike other platforms, eliminates the need to install any new software or create new identities. Instead, we form a **"private core"** that keeps your cryptography local but adds an always available API that developers can access for content, messaging, and more. And that's only the beginning of what cores can offer.

Kubelt isn't built just for Web3. A Kubelt Core is a fully generalized backend that can break down data silos and simplify integrations, all user permissioned and private. For instance, with Kubelt, your bank can generate content addresses containing your banking information using your favorite accounting software's public key permissioned by you or, in a similar way, even host and permission your health care records.

It doesn't stop there either. Kubelt developers and users can provide single or multi-signing Kubelt cores that can be laid out in configurations that gate and or commercialize access to public or protected content. These configurations are significant for SaaS applications, DAOs, and more.

The possibilities are virtually endless.

### What's Next?

<img src="/images/enter_kubelt.png" width="{{ .Width }}" height="{{ .Height }}">

Kubelt is building a more extensive, better, user-centric web. If you like what we're doing and want to learn more, follow us on [Twitter](https://twitter.com/kubelt) and join us on [Discord](https://discord.gg/UgwAsJf6C5).

For early access [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of the decentralized web, together!
