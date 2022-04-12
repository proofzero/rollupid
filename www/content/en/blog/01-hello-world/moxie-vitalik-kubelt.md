---
title: "Kubelt's Approach to a Decentralization"
description: "Introducing Kubelt, the future of web3 infrastructure."
lead: "Introducing Kubelt, the future of web3 infrastructure."
date: 2022-04-05T14:25:35-04:00
lastmod: 2022-04-05T14:25:35-04:00
weight: 50
images: ["kubelt.png"]
draft: false
contributors: ["@alfl", "@maurerbot"]
---

```
Notes to cover off Skynet
- go across all ecoysytems both blockchian and classical
> Users on Skynet only have to onboard one time. Once you’ve created an account, that account can follow you from your chatroom to your blogger to your banking. Once you’ve uploaded a profile picture, every single app in the Skynet ecosystem can reference and load your profile picture, and you can use the same username across the entire ecosystem.
- private cores!

- Users and developers alike prefer convenience to security" is a bad assumption

> Developers also enjoy benefits in the decentralized world. Applications don’t have any operational overhead, as the costs are shouldered by the users and the infrastructure is managed by the network. The is no need to create AWS accounts or spin up dedicated servers, and no need to plan for a contingency of hyperbolic growth. The network automatically handles many pain points, and allows the developers to largely focus on writing features and engaging users.
- I AGREE

- [ details about the Kubelt Cores client-server model ]
- [more secure and no blockchain fees]

- No browser extension needed; verify against the cores

- Possibilities of cores in hardware in a peer to peer configuration (your crypto hosted locally for 100% local first)

- Future isn't web2 v web3, just a bigger, better, user-centric web.


- The answer is right infront of you, the wallets

- why it's better than solid and skynet is you don't have to be just on our ecosystem to get value

```

Back in January [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html) and [Vitalik responded](https://old.reddit.com/r/ethereum/comments/ryk3it/my_first_impressions_of_web3/hrrz15r/). Both raised issues fundamental to the future of web3 infrastructure but also, unknowlingly provided the arguments for why and even how to address them.

In summary, Moxie argues people will never run their own servers and we tend to agree. For the majoirty of users, the convenience of centralized services far outweigh any known trade offs in data privacy or other unkown.

The same convenience of centralized platforms applied to developers seems obviously true when you look at the big uptake in platforms like Infura and OpenSea. Ignoring any associated risks, Moxie himself claims **centralized platforms** permit faster innovation than **decentralized protocols** but, is this a valid comparison?

Platforms and protocols are two very different categories. The former is generally built on the latter and layers in complex, opininated technologies and frameworks on top of simple primitives. Ultimately, it is the adoption and conformance of these opinions, paid acquisition or otherwise, what makes centralized services so successful and exploitive.

But what if you could push opinionation to the edge and maintain the simplicity of the protocols?

As a team building a part of the decentralized future, here's our take.

### Local-first, edge

### Convenience and Privacy

The walrus and the carpenter

### Better Outcomes for users and business

### Novelity and examples

## Enter Moxie

To summarize Moxie's point, he claims that **centralized platforms** permit faster innovation than **decentralized protocols**. He gives an example (emphasis his):

> Likewise, the web3 protocols are slow to evolve. When building First Derivative, it would have been great to price minting derivatives as a percentage of the underlying’s value. That data isn’t on chain, but it’s in an API that OpenSea will give you. People are excited about NFT royalties for the way that they can benefit creators, but royalties aren’t specified in ERC-721, and it’s too late to change it, so OpenSea has its own way of configuring royalties that exists in web2 space. Iterating quickly on centralized platforms is _already outpacing the distributed protocols and consolidating control into platforms_.

Unfortunately this is an apples-to-oranges category error: **protocols are not platforms**. AWS doesn't compete with HTTPS. GCP doesn't compete with SFTP. Azure doesn't compete with gopher.

Moxie's unspoken assumption is that decentralization must be achieved via protocols rather than platforms. What if you _could_ query an API that gives you underlying value or other aggregated data? What if smart contracts _could_ embed upgradable business logic?

What if the platform itself was decentralized?

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

## Enter Kubelt

Web3 does have a ["web2 problem"](https://discord.com/channels/790660849471062046/956202308214095872/961623808958156831). Smart contracts do need upgradable data and business logic. Building on a peer network has significant advantages.

That's why we built Kubelt. Our peers -- "Kubelt Cores" -- offer distributed compute, storage, networking, and cryptography capabilities. They compose into a fully decentralized application platform, the missing middle tier for web3.

You can use Kubelt to run APIs, upgrade their logic, query chain data, run your own oracles, store customer data, authenticate users, all in a fully distributed application model.

Imagine your smart contracts being token-gated into your own API ecosystem, more available than OpenSea, cheaper than AWS, and without having to run your own servers. That's Kubelt.

Moxie winds up with a great point, and we'll end on the same note:

> We should try to reduce the burden of building software.

Agreed! [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of web3 infrastructure, together!
