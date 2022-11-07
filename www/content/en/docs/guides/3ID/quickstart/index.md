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
