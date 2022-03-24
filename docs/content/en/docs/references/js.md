---
title: "Kubelt JS"
description: "JavaScript API Reference"
lead: ""
draft: false
images: []
menu:
  docs:
    parent: "references"
weight: 300
toc: true
---

#### Intro

This reference documents every object and method available in Stripe's JavaScript library, kbt.js. Take a look at our [Kubelt dApp]() or [Kubelt Sanity Plugin]() packages as a reference for how to use this library.

#### Looking for a step-by-step guide?

Learn to setup [Dynamic NFT Content]({{< relref "NFT" >}}) and [Kubelt dApp]({{< relref "dapp" >}}) guides.

#### Not a developer?

Try our [Kubelt Sanity Plugin]() instead.

---

## Installation

```
npm install --save @kubelt/kubelt-js

OR

yarn install --save @kubelt/kubelt-js
```

Or use our CDN

```html
<script src="https://js.kubelt.com/alpha"></script>
```

#### Including

<details open>
  <summary>ES Next</summary>
  <pre><code class="javascript">import { 
    v1 as Kubelt,
    v1.core as KubeltCore,
    v1.core.content as KubeltContent } from 'kubelt-js'</code></pre>

</details>

<details>
  <summary>Common JS</summary>
  <pre><code class="javascript">const Kubelt = require('kubelt-js').v1
const KubeltCore = require('kubelt').v1.core
const KubeltContent = require('kubelt').v1.core.content</code></pre>
</details>

---

## Initialization

#### Kubelt.init(config?)

Use `Kubelt.init(config?)` to create an instance of the **Kubelt object**. The Kubelt object is your entrypoint to the rest of the Kubelt JS SDK.

TODO: note on the functional pattern of the SDK

##### Method parameters

| name              | type     | data type | description                       |
| ----------------- | -------- | --------- | --------------------------------- |
| options           | optional | object    | Kubelt SDK configuration options  |
| options.p2p       | optional | object    | Node configuration options        |
| options.p2p.read  | optional | string    | Multiaddress for read operations  |
| options.p2p.write | optional | string    | Multiaddress for write operations |
| options.wallet    | optional | string    | Kubelt Wallet object              |
| options.logging   | optional | enum      | Log level setting                 |

##### Example

```JavaScript
const kbt = Kubelt.init({
  p2p: {
    read: "/ip4/127.0.0.1/tcp/9061",
    write: "/dns/api.kubelt.com"
  },
  wallet: wallet,
  logging: Kubelt.logging.INFO
}
```

**TODO: some kind of multiaddress for cores?**

{{< alert icon="⚠️" text="NOTE: Kubelt  currently only supports p2p.write operations through API gateway." />}}

---

## Kubelt Cores

Requests made by the Kubelt JS SDK will be made to the dns addresses configured in the p2p options object during the initilziation process. The hostname of the DNS address represents the Kubelt Core scope.

For instance, requests made to `api.kubelt.com/@alice/` will be routed to the **@alice** core with identity asserations made by the requester via JWT. The general pattern with scope is:

```
https://<api.kubelt.com | CNAME>/@{core}/<some/standard/core/endpoint> -H "kbt-identity-assertion-token: JWT"
```

In doing so, cores can be organized by user, organization, application and/or any other use case.

{{< alert icon="👉" text="Kubelt allows CNAME configurations to help dApps access the network." />}}

---

## The Wallet object

Kubelt uses a wallet object to that represent the current selected core and a reference to signing and decryption functions. This allows the developer to use they library of their choice (e.g. web3.js or ethers.js) as well as select an RPC signer or in memoery wallet (e.g. web3.eth.personal or web.eth.accounts).

##### Properties

| name         | type     | data type | description                            |
| ------------ | -------- | --------- | -------------------------------------- |
| address      | required | string    | Selected wallet account address        |
| sign-func    | required | function  | Wallet provider signing function       |
| type         | optional | enum      | Kubelt wallet type. Default "Metamask" |
| encrypt-key  | optional | string    | Encryption key for selected account    |
| decrypt-func | optional | function  | Wallet proider decryption function     |

#### Kubelt.wallet.set(kbt, wallet)

The Kubelt JS SDK requires a wallet (aka a signer) to be set provided to perform spcific actions like authentication.

TODO: note on how wallet state is managed

##### Method Properties

| name   | type     | data type | description                   |
| ------ | -------- | --------- | ----------------------------- |
| kbt    | required | string    | An instance of the Kubelt SDK |
| wallet | required | string    | The Wallet object             |

##### Returns

| name | data type | description                                    |
| ---- | --------- | ---------------------------------------------- |
| sdk  | object    | Updated instance of the Kubelt SDK with wallet |

```javascript
  let kubeltWallet = null
  ethereum.on('accountsChanged', handler: (accounts) => {
    const signFunc = async (msg) => {
      return await web3.eth.sign(msg, accounts[0])
    }

    kubeltWallet = {
      address:  accounts[0],
      sign_func: signFunc
    }

    sdk = Kubelt.wallet.set(kbt, wallet)
  });
```

---

## Core API

### authenticate(kbt, core)

Use `KubeltCore.authenticate` to perform a zero-knowledge proof to authenticate against the Kubelt peer-to-peer network.

The authentication method will request a nonce from the selected core, as indicated by their wallet object, for the client to sign and return. In doing so, the selected core will validate the proof and issue a signed JWT token representing the user's authoirzation to and identity to the core for subsequent requests.

{{< alert icon="👉" text="The selected core and entrypoint for when first authenticating is typically a core configured for the user's wallet adress." />}}

##### Method Properties

| name | type     | data type | description                                   |
| ---- | -------- | --------- | --------------------------------------------- |
| kbt  | required | string    | An instance of the Kubelt SDK                 |
| core | optional | string    | Kubelt Core name (defaults to wallet address) |

##### Returns

| name | data type | description                                    |
| ---- | --------- | ---------------------------------------------- |
| kbt  | object    | Updated instance of the Kubelt SDK with wallet |

##### Example

```javascript
kbt = await KubeltCore.authenticate(kbt, "alice.org");
```

### describe(kbt, core)

Use `KubeltCore.describe` to introspect a core and it's config.

##### Method Properties

| name | type     | data type | description                                   |
| ---- | -------- | --------- | --------------------------------------------- |
| kbt  | required | string    | An instance of the Kubelt SDK                 |
| core | optional | string    | Kubelt Core name (defaults to wallet address) |

##### Returns

| name | data type | description                  |
| ---- | --------- | ---------------------------- |
| core | object    | An instance of a core object |

##### Example

```javascript
const core = await KubeltCore.describe(sdk, "alice.org");
```

### permission(kbt, core, signer)

Use `KubeltCore.permission` to add a signer to a core with role/permissions.

TODO: definition

### revoke(kbt, core, signer)

### addCore(kbt, core)

## Content API

<!--### ipfsAdd(kbt, core, content, metadata)-->

### publish(kbt, core, content, name, metadata)
