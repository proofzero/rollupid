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

Back in January [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html) and [Vitalik responded](https://old.reddit.com/r/ethereum/comments/ryk3it/my_first_impressions_of_web3/hrrz15r/). Both raised issues fundamental to the future of web3 infrastructure but also, unknowlingly provided the arguments for why and even how to address them.

In summary, Moxie argues people will never run their own servers and we tend to agree. For the majoirty of users, the convenience of centralized services far outweigh any known or otherwise unknown trade offs in data privacy.

The same convenience of centralized platforms applied to developers seems obviously true when you look at the big uptake in platforms like Infura and OpenSea. Ignoring any associated risks, Moxie himself claims **centralized platforms** permit faster innovation than **decentralized protocols** but, is this a valid comparison?

**Platforms** and **protocols** are two very different categories. The former is generally built on the latter introducing opininated technologies and services. These platforms force developers to conform applications to their opinions -- the greater the conformance the stickier the technology and risk of exploitation.

But what if you could push opinionation to the edge? How could that improve outcomes and experience for both developer and user?

As a team building a part of the decentralized future, here's our take.

### The Centralization Success Trap

A major selling point of centralization is the convenience of data aggregration and co-location of compute. When data and compute are co-located developing applications becomes very straight forward (more on that later). The more abastract the relationship between data and compute, the easier it is to create secure applications.

Platforms achieve this value through focused, hyper-opinionated services **in the middle** and, as confirmed by Moxie, this is a massive advantage for applications in early stages of development as less resources are required to get to innovate. But what's the catch?

Similar to the story of [The Walrus and the Carpenter](https://en.wikipedia.org/wiki/The_Walrus_and_the_Carpenter) all of this sounds great _until it's not_. As your application scales with your success, the cost of these choices begin to show their fangs and you have little means of replatforming. Now you are stuck with the surprise compute and egress fees eating away at your bottom line and the pressure is on.

What you want is a system that allows developers to enjoy the benefits in the decentralized model without any of the operational overhead and contingency planning for hyperbolic growth.

### The Right Protocol for the Right Problem

If co-location of data and compute makes for a better developer experience and focused opinionated services accelerate development, how can we apply this in a decentralized platform and get similar results without the trade offs?

Blockchain seems like the obvious answer and we would agree this is true for many use cases involving **trusted state transitions**. DeFi, NFT, and other transactional use cases that require a consensus on state make great sense for blockchains! For these cases smart contracts and associated fees provide an acceptable cost in DX and UX for increased trust, security and transparency. For everything else like application logic, content, and other **eventually consistent** use cases this cost for developers and users is not acceptable.

It is, afterall, the eventually consistent use case that makes up the bulk of all applications. This is where the team at Kubelt did a lot of thinking about how to develop a **decentralized middle tier**.


### The User is the Application

Where we started thinking is, if blockchains are decentralized and clients are decentralized, could we push all the opinions out to the user at the the edge?

In doing so, we should be able to co-locate everything with the user and take advantage of a local-first application model using user cryptography and ubiquitous runtimes. When the problem is **user sized**, developers can user their favorite tools and libraries, simplifying their stack while maintaining:

✅ Better privacy \
✅ Better costs \
✅ Better control

However, all of this is easier said then done! So, we decided to take a look around and see if any work in this area has been attempted in the past? What we found was an evolution ready to pop!

Starting from the early days of the Message Object Model (SmallTalk, Corba) and the more recent State Actor Model (Erlang, Akka) we finally realized, the answer we were looking for was right infront of us, **Wallets!** With crypto wallets, developers could have ubiqitous local-first access to:

🤯 Local-first user cryptography \
🤯 Messaging APIs \
🤯 Blockchains

All that's missing is content management for data and compute!

### Content is Everything

To truly decentralize an application you also need to decentralize the application content itself. As we already discussed, most blockchains aren't great for this, with the exception of [Filecoin](ipns://filecoin.io/). That said, you can't run a blockchain on the client which is why a **peer-to-peer content delivery network** like [IPFS](ipns://ipfs.io/) is just as important.

When backing IPFS with Filecoin all content is available through a decentralized network encoded as immutable **content addresses**. These addresses can pack anything from JSON documents to sqlite databases, WASM and more -- you pick! In doing so, you are also breaking problems down to a size that can be handled by a client at the edge where you can **"bring you own opinions"**.

There is already an **ecosystem** of open-source, client-side libraries, frameworks and tools that can continue to grow and flourish independently of any service. For instance, the local-first work being done by [Ink and Switch](https://www.inkandswitch.com/) solving for distributed conflict resolution data types (CRDTs).

Furthermore, the same content addresses can pack and fully encrypt signatures, schemas, versions and more collapsing APIs into decentralized protocol that can materialize content anywhere for **novel applications**. This also has the advantage of making migrations a much simpler offline, client concern.

### Permissioning = Better Outcomes for Everyone

- no new accounts / complex identity (compare to others like skynet)
- Users and developers alike prefer convenience to security" is a bad assumption (skynet)
- entry point into a peer networl
- pro-blockchain and pro-web2
- governace
- integrations
- extending traditional into web3
- messaging
- open banking and open patient records

### What's Next?

vitalik peer to peer response

- Possibilities of cores in hardware in a peer to peer configuration (your crypto hosted locally for 100% local first)

Agreed! [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of web3 infrastructure, together!

## Enter Kubelt

Web3 does have a ["web2 problem"](https://discord.com/channels/790660849471062046/956202308214095872/961623808958156831). Smart contracts do need upgradable data and business logic. Building on a peer network has significant advantages.

That's why we built Kubelt. Our peers -- "Kubelt Cores" -- offer distributed compute, storage, networking, and cryptography capabilities. They compose into a fully decentralized application platform, the missing middle tier for web3.

You can use Kubelt to run APIs, upgrade their logic, query chain data, run your own oracles, store customer data, authenticate users, all in a fully distributed application model.

Imagine your smart contracts being token-gated into your own API ecosystem, more available than OpenSea, cheaper than AWS, and without having to run your own servers. That's Kubelt.

Moxie winds up with a great point, and we'll end on the same note:

> We should try to reduce the burden of building software.

## Enter Vitalik

[Let's slice Vitalik's list](https://old.reddit.com/r/ethereum/comments/ryk3it/my_first_impressions_of_web3/hrrz15r/) of ways to inspect chain data (this time **emphasis mine**):

> 2.  Run a piece of code that asks the Infura API endpoint what the blockchain state is, trust the answer. However, keys are still kept locally; the code signs transactions locally and sends them to the Infura API endpoint to be re-broadcasted.
> 1.  Same as (2), but the code also runs a light client to verify the signatures on the block headers and uses Merkle proofs to verify individual account and storage data.
> 1.  Same as (3), but the code talks to N different API endpoints run by N different companies, so only 1 of them need to be providing honest answers for the connection to be reliable.
> 1.  **Same as (4), but instead of pre-specifying N API endpoints the code connects directly to a p2p network**
> 1.  **Same as (5), but the code also does data availability sampling and accepts fraud proofs, so it can detect and refuse to accept blocks that are invalid.**

Vitalik's argument picks up where Moxie's left off, querying a centralized platform: "call the Infura API". He develops it, adding assurance and availability capabilities, and by points five and six arrives at a decentralized peer-to-peer model.

This is how a decentralized platform can achieve the same functional capabilities (in this case accessing chain data) with superior non-functional capabilities (better availability, better trustability), all while being cheaper (peers run everywhere with no egress fees).

So: platforms aren't protocols, and decentralized platforms are better than centralized platforms.

If only someone would build a decentralized platform!
