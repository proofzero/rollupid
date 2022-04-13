---
title: "Accelerating Courtyard.io"
description: "How Courtyard.io used Kubelt to get to done, fast!"
lead: "How Courtyard.io used Kubelt to get to done, fast."
date: 2022-04-06T00:00:00+00:00
lastmod: 2022-04-06T00:00:00+00:00
menu:
  courtyard:
    parent: "showcase"
weight: 10
draft: true
contributors: ["@alfl"]
categories: ["Case Studies"]
tags: ["CMS", "headless", "API", "backend"]
---

Nico and Paul started [Courtyard.io](https://courtyard.io) to provide infrastructure that allows people to securely tokenize physical assets into NFTs. [Check them out on OpenSea](https://opensea.io/collection/courtyard-nft))!

Courtyard started with professionally graded and securely stored Pokémon cards. They wanted to build a reveal mechanic, where NFTs representing the physical cards were sold and revealed later when the owner "ripped open the foil pack".

They had a couple of requirements:

1. It had to be clear to the owner that the physical card they received was the same that was "sealed" in the pack.
1. They had to be able to manage the card data in bulk.
1. They wanted to use a solution that was as fully decentralized as possible.

Courtyard decided to use [Kubelt, web3's decentralized application platform]({{< relref "/blog/moxie-vitalik-kubelt.md" >}}), to build the reveal mechanic because it let them specify their own cryptographically verifiable content identifiers (requirement 1) and allowed them to manage content via bulk upload (requirement 2) to our peer network (requirement 3).

They ended up getting the reveal mechanic shipped ahead of time and under budget, letting their engineering team focus on building further down their roadmap.

One of the benefits of well-designed peer networks is that they're more stable than centralized systems. On Courtyard's launch day:

1. Github failed
1. Infura failed
1. Polygon failed

**But Kubelt held fast.**

If you want to build

Agreed! [Get in touch for access,](https://omq1ez0wxhd.typeform.com/to/IXfcN3Xf) tell us about your use case, and let's build the future of web3 infrastructure, together!
