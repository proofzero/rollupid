---
title: "Kubelt JS"
description: "JavaScript API Reference"
lead: ""
draft: false
images: []
menu:
  docs:
    parent: "references"
weight: 430
toc: true
---

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
  <pre><code class="javascript">import Kubelt from 'kubelt'</code></pre>

</details>

<details>
  <summary>Common JS</summary>
  <pre><code class="javascript">const Kubelt = require('kubelt')</code></pre>
</details>

---

## Initialization

#### Kubelt(config?)

Use `Kubelt(config?)` to create an instance of the **Kubelt object**. The Kubelt object is your entrypoint to the rest of the Kubelt JS SDK.

##### Method parameters

| name              | type     | data type | description                       |
| ----------------- | -------- | --------- | --------------------------------- |
| options           | optional | object    | Kubelt SDK configuration options  |
| options.p2p       | optional | object    | Node configuration options        |
| options.p2p.read  | optional | string    | Multiaddress for read operations  |
| options.p2p.write | optional | string    | Multiaddress for write operations |
| options.logging   | optional | enum      | Log level setting                 |

##### Example

```JavaScript
const kubelt = Kubelt({
  p2p: {
    read: "/ip4/127.0.0.1/tcp/9061",
    write: "/dns/api.kubelt.com"
  },
  logging: Kubelt.logging.INFO
}
```

**TODO: some kind of multiaddress for cores?**

{{< alert icon="⚠️" text="NOTE: Kubelt only supports p2p.write operations through API gateway." />}}

---

## Kubelt Cores

Requests made by the Kubelt JS SDK will be made to the dns addresses configured in the p2p options object during the initilziation process. The hostname of the DNS address represents the Kubelt Core scope or host.

For instance, requests made to `api.kubelt.com/@alice/` will be received by the **@kubelt** core and routed to the **@alice** core with identity asserations made by the requester via JWT. The general pattern with scope is:

```
https://<host core>/<routing core>/<some/standard/core/endpoint> -H "kbt-identity-assertion-token: JWT"
```

In doing so, cores can be organized by user, organization, application and/or any other use case.

{{< alert icon="👉" text="Kubelt allows CNAME configurations to the gateway to cores provisioned on the network." />}}

---

## The Wallet object

Kubelt uses a wallet object to that represent the current selected account and a reference to signing and decryption functions.

##### Properties

| name         | type     | data type | description                         |
| ------------ | -------- | --------- | ----------------------------------- |
| type         | required | enum      | Kubelt wallet type                  |
| address      | required | string    | Selected wallet account address     |
| sign-func    | required | function  | Wallet provider signing function    |
| encrypt-key  | optional | string    | Encryption key for selected account |
| decrypt-func | optional | function  | Wallet proider decryption function  |

---

## Authentication

#### kubelt.autenticate(wallet)

Use `kubelt.authenticate(wallet)` to perform a zero-knowledge proof to authenticate against the Kubelt peer-to-peer network.

The authentication method will request a nonce from the user's core, indicated by their wallet address, for the client to sign and return. In doing so, the user's core will validate the proof and issue a JWT token representing the users identity for subsequent requests. The JWT will be signed by the host core configured in the initialization step.

##### Method Properties

| name   | type     | data type | description          |
| ------ | -------- | --------- | -------------------- |
| wallet | optional | required  | Kubelt Wallet object |

##### Example

```javascript
import Web3 from "web3"

const web3 = Web3(provider)
const accounts = await web3.eth.getAccounts()

const wallet = {
  type: "Metamask",
  address: accounts[0],
  sign-func: web3.eth.sign,
}

const error = await kubelt.authenticate(wallet)

```

---

\*\*NOTE: design goal is that billing actions should always be is delegate to host and/or routed cores by some indexed relationship between cores"

## Scope

#### kubelt.scope.idFromName(name)

#### kubelt.scope.select(id)

Checks for the scope existence and sets the scope context from the results

#### kubelt.scope.add(name)

Creating scopes is typically to permission other scopes into it for collaboration.

#### kubelt.permissionToScope(

#### kubelt.core.deleteScope(name)

#### kubelt.core.scope.selectByID(name)

Use `kubelt.scope(name)` to switch cires

Scope:

- Config in Cloudflare KV store
  - one entry per core in KV
    - Standard interface for managing scopes
    - CNAMES
    - AUTH/Permissioning
    - Edge Core? or Hypercore?
    - ...?

Namepace:

- standard interface for managing content
- Durable Object (DO)
- State namespaced to DO ID -> KV store contained within DO
- Base config + overrides per ID
- Content Mangement

E.g.

@courtyard.io/pokemon
@courtyard.io/baseball

@maurerbot/twitter

@kubelt:

- api.kubelt.com <- host headers
-

1. Edge Cores (Durable Objects)

- standard interface across all instances

FUTURE: 2. Hypercores "Hyperbelt"

- standard interface like Edge cores
- customizable
- can side step our gateway and use their own

Init:

// create an account wallet instance
// const wallet = {...}

// create instance of kublt SDK
const kbt = Kubelt.Init.v1(...config) // e.g. top level @scope / hostname

// user clicks connect

// 1. send the account-address to the API create a ZK_AUTH DO
// 2. get a nonce
// 3. sign the nonce (prompt with sign-fn)
// 4. send the signed nonce and run ecrecover to get the public key and reproduce the account address
// 5. find the ZK_AUTH DO
// 6. verify signature and send the JWT (include users public key in payload)
const ok = kbt.authenticate!(wallet) // setup @cosmin

---

// 1. Send a request to the API to get the CID for "account-address")
// 2. API created DO instance tied to "account id" (using the JWT info)
// 3a. If empty state assign the default user CID from the @kubelt core by using public key in the JWT config injected and return
// 3b. Return the CID for the DO
// 4. Request the CID content from IPFS on the client

```
GET api.kubelt.com/:account-address/
POST api.kubelt.com/:account-address/ -p {"...configs"} -H "kbt-access-assertion....: {JWT}"

const core =  CORE.byId(account-adddress)
const stub = core.getInstance()
stub.fetch("/") // returns a CID with encrypted "workspace/namespace metadata (dag-jose)"
```

// 5. Decrypt the content and load into triple store
// 6. Query the user profile and return a User object
// prompt for public key if not stored in local storage

const workspace = kbt.getScope() // @0xabc123

### TBD What is a scope?

- A bunch of triples with an account address?
- Can be configured with CNAMES
- One alias per account address?
- Permissiing other parent scopes?

// creates a metadata entry in the triple store (standard kubelt vocab)
// update my core by
// -
const scope = kbt.scope.add("@courtyard.io", ...configs) @0xabc123 -> @courtyard.io

kbt.scope("@courtyard.io") // switch scope

// TODO: config scopes

kbt.scope.namespace.add("pokemon")

---

## Content Namespace

NOTE: if courtyard runs a "user login" with our SDK that is equivilant to creating a kubelt user and then they have to configure courtyard content namespace and permission it to their scope?

@0xabc123/crtsomethingrandomanddeterinistic <- permissioned to store courtyard data with @user's JWT material

@cosmin/h9fuagfu9shf9easfh9a8fh (some hash of the sanity project id) <- @cosmin

- / <- metadata semantic graph
- /:hash <- CID (e.g. /abc123)
- /dref/:name <- CID (e.g /dref/pikachi)

@adrian/someanity-projectid-randmom <- @adrian

// ideal if sanity was our customer and writing to sanity scopes
@sanity/someprouectid | gtwy | <- @sanity <- sanity users

// creat or fetch namespace
kbt.namespace("sanity project id")

### Publish Metadata

```json
const data = {
  "animation_url": "/relative/path/to/courtyard_back_to_school_sealed_pack.mp4", // turn this into cid
  "name": "Genesis Sealed Pack (0x0a12...8864)",
  "revealed": false,
  "image": "https://content.courtyard.io/img/courtyard_back_to_school_sealed_pack.gif", // turn this into cid
  "drop": { "name": "Genesis Drop: Back To School", "id": "0001" },
  "proof_of_integrity": "0x0a123e64fec631792dd32dd29ebd76c39be30ef33dbc361fbc2f21e0c5858864",
  "description": "**Back To School** is the first drop of physically backed NFTs showcasing the technology created by Courtyard. This pack contains an NFT backed by a unique, real graded Pokemon TCG card that was randomly assigned at mint time, along with a unique identifier (0x0a123e64fec631792dd32dd29ebd76c39be30ef33dbc361fbc2f21e0c5858864) derived from the human readeable fingerprint of the physical item - which will be revealed at the same time as the NFT itself - using the Keccak256 cryptographic function. This unique identifier serves as a verifiable *Proof of Integrity* to certify that the corresponding physical asset is irrevocably associated to this NFT and vice-versa."
}


```

https://content.courtyard.io/pokemon/0x0a123e64fec631792dd32dd29ebd76c39be30ef33dbc361fbc2f21e0c585886/image.png

const image = Kubelt.IPFS.add(data["image"])
const animimation_url = Kubelt.IPFS.add(data["animation_url"])

// we are in a @courtard.io/pokemon scope/namespace
const thing = kbt.content.generateIRI("something") // courtyard.io/pokemon/0x0a123e64fec631792dd32dd29ebd76c39be30ef33dbc361fbc2f21e0c585886
thing.append({...data, image, animtmation_url})
thing.append("image.png", image)
thing.append("animation_url.mp4", animation_url)
thing.commit()

kbt.resource.describe(updated_metadata)

const thing = kbt.content.id("id") // create the id
thing.append("subject", kbt.ipfs.add(<image>)) // hang metadata off id
thing.commit()

// batch
kbt.content.describe("some json-ld") // semantics

### Name Content (add a namespace KV entry for indexing)

// a deternminstic hash (proof) indexed that can be looked up by "name" and "hash"
const hash = kbt.name.add("name", nil)
const hash = kbt.name.add("name", "@id")

### Importing content

NOTE: we want to maintain unique ids from the orignal data for interopability

---

## Sanity Plugin

1. Init
2. Auth
3. Content Namespace (fetch or create)
4. Publish metadata and content to namespace
