---
description: Decentralized Profile Graph with Connected Services
cover: ../.gitbook/assets/Docs_-_Overview_V1.png
coverY: 0
---

# Galaxy

At the core of the Rollup Platform is the open source Profile Graph deployed at the edge on [Cloudflare's](https://www.cloudflare.com/en-gb/) global infrastructure.

### Why Profile Graph?

The Profile Graph was inspired by the [W3C decentralized identifier](https://w3c.github.io/did-use-cases/) specification. We originally set out to build a DID fully compatible platform but, as we began building, we quickly learned that the developer experience was complex and that the specification would require multi-party adoption at mass to be successful.

Instead, we looked at already massively successful protocols like OAuth and decided we would build a protocol that was familiar to developers and users but respected the goal of the DID spec:

* **Decentralized**: end users should be the issuers
* **Persistent**: identifiers should be inherently persistent (and deterministic)
* **Cryptographically Verifiable**: it should be possivle to prove control of the identifier
* **Resolvable**: it should be possible to discover metadata about the identifier

### How it works?

Everything on Rollup is centered around profiles and every profile is represented by a node on the graph. Profile nodes are attached to other nodes on the graph that represent things like accounts, authorizations, storage, and more. &#x20;

You can think of nodes as tiny distributed and isolated applications that are only reachable with the right authorizations. Data managed by these nodes also do not mix since each manages it's own data namespace. This also means in order to find a node you need to be able to generate or search for it's unique namespace identifier.

### Uniform Resource Names (URN)

The uniform resource name format from [RFC 8141](https://www.rfc-editor.org/rfc/rfc8141) is used in the profile graph to identity nodes on the graph.&#x20;

For example, `urn:rollup:profile/abc123` tells us that within the "rollup" domain get the "profile" node with the namespace id "abc123".  Generating this name usually requires authentication but there are vectors into the graph that do not require this authentication (address nodes are one such example).

{% hint style="info" %}
Even if you were to guess as urn you would also need the right authorization to interact with it's APIs. &#x20;
{% endhint %}

### Traversing the Graph

The edges that connect the nodes on the graph together allow for graph traversal queries. However, to traverse the graph proper authorizations are required.&#x20;

To learn more about querying the graph check out the [Galaxy API](../reference/galaxy-api.md).

###

