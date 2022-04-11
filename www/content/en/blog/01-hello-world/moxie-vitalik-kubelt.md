---
title: "Moxie & Vitalik & Kubelt"
description: "Introducing Kubelt, the future of web3 infrastructure."
lead: "Introducing Kubelt, the future of web3 infrastructure."
date: 2022-04-05T14:25:35-04:00
lastmod: 2022-04-05T14:25:35-04:00
weight: 50
images: ["kubelt.png"]
draft: true
contributors: ["@alfl", "@maurerbot"]
---

Back in January [Moxie wrote about his first impressions of web3](https://moxie.org/2022/01/07/web3-first-impressions.html) and [Vitalik responded](https://old.reddit.com/r/ethereum/comments/ryk3it/my_first_impressions_of_web3/hrrz15r/). Both raised issues fundamental to the future of web3 infrastructure. The whole conversation is worth a deep, critical read.

As a team building the future of web3 infrastructure, here's our take.

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
