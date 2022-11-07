---
title: "3ID Quick Start"
description: ""
lead: ""
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "3id"
weight: 700
toc: true
---

3ID is the easiest way for developers to give users a consistent, friendly experience across apps. You're one query away from giving users a personalized experience that increases their trust and joy in using your product.

### 3ID Profile Request

Profile requests take the form `https://3id.kubelt.com/<resolver>/json`, where `<resolver>` is a unique account identifier (e.g. an Ethereum address).

| Resolver    | Description                | Example *                                    | Status      |
| ----------- | -------------------------- | -------------------------------------------- | ----------- |
| Ethereum    | Ethereum account addresses | 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52   | Live        |
| ENS         | ENS domain names           | alfl.eth                                     | On Deck     |
| Discord     | Discord User ID            | alfl.eth#4625                                | Up next     |
| Telegram    | Telegram Account           | @alfl_eth                                    | Up next     |
| Solana      | Solana account addresses   | Bkfg6t8tyLrDEksB3Ch8GMBbo5f33zy9hhDkX3FvTuRR | Coming soon |
| Twitter     | Twitter Account Login      | @alfl                                        | Coming soon |
| Google      | Google Account Login       | alex.flanagan@gmail.com                      | Coming soon |
| Email       | Oldschool email account    | alex@kubelt.com                              | Coming soon |
| Phone       | Phone number / SMS         | (647) 927-4901                               | Coming soon |

** * NOTE: Examples are presented as plaintext but might need some processing (hashing, login, validation, etc.) before you use them. **

[Join our Discord](https://discord.gg/UgwAsJf6C5) to tell us which resolvers you want.

### 3ID Profile Response

```json
{
	"displayName": "Polynomics",
	"pfp": {
		"image": "https://nftstorage.link/ipfs/bafybeiagnu4c32iqr2frinkoiwngzdkk24f4b2ivdwvqldfxnqfhpepdty/threeid.png"
	},
	"cover": "https://nftstorage.link/ipfs/bafybeid6dvlznmbv3wnuclmpgdxfkyzea65yve2gpjebj2eamlb2bifsoq/cover.png",
	"location": null,
	"job": null,
	"bio": null,
	"website": null,
	"claimed": true
}
```

### Custom User Data

Using 3ID means you don't have to worry about storing user data -- your users can store it themselves!

In order to store your own custom application data within a user's 3ID profile you will need to use a custom application namespace as well as our new encrypted storage RPC methods. [Join our Discord](https://discord.gg/UgwAsJf6C5) to talk to us about your use case and get beta access.

### FAQ

Joining our [Discord →](https://discord.gg/UgwAsJf6C5) is the fastest way to get your question answered.
