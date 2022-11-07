---
title: "Whitepaper"
description: "Kubelt is an open source toolkit for building peer-to-peer dapps. Using a CMS dapp, SDK, and peer node, developers can build dapps quickly using open standards, allowing maximum interoperability, easy scalability, and high availability. This paper describes the full architecture of a system composed from these components and its theoretical foundations."
lead: "A physical approach to distributed semantic graphs."
date: 2021-12-01T00:00:00+00:00
images: []
menu:
  docs:
    parent: "basics"
weight: 150
toc: true
draft: true
---

_December 2021. By [Alexander Flanagan](mailto:alex@kubelt.com), [Adrian Maurer](mailto:adrian@kubelt.com), and [Robert Medeiros](mailto:rob@kubelt.com). Special thanks to the team @ [Protocol Labs](https://protocol.ai)._

## Abstract

Kubelt is an open source toolkit for building peer-to-peer dapps. Using a CMS dapp, SDK, and peer node, developers can build dapps quickly using open standards, allowing maximum interoperability, easy scalability, and high availability. This paper describes the full architecture of a system composed from these components and its theoretical foundations.

## Introduction

Kubelt is the web3 CMS, built on top of a distributed semantic graph. This document outlines a set of desired properties, components, a theoretical framework, and a high-level discussion of the system design for Kubelt.

A semantic graph is a data structure that encodes relationships between data points. This lets us add a layer of meaning to the data stored on web3. We can, for instance, tell that a content address like _bafyreiabc123_ is actually, for example, the first frame of a video, the configuration for a metaverse object, localized UI text, etc.

The system enables sharing of arbitrary data, including without limitation text, images, rich media, executable objects (e.g., WASM), metadata, etc. All of this is stored in a graph distributed over a peer-to-peer network.

The system supports layers for conflict resolution, strong eventual consistency, corporate governance, encryption at rest and in transit, support for encryption at compute (i.e., homomorphic, secure multiparty computation, etc.), and other layers.

Security is further enhanced through standard third-party authentication methods, out-of-band key verification, user ownership of data, and logical and physical network partitions.

## Desired Properties

### Content delivery

It is desirable that graph content be shared over a peer-to-peer network both to reduce system cost and to affect a distributed/decentralized architecture. Kubelt delivers this capability.

### Content addressing

In a distributed system, it is desirable that content be consistently addressable and without reference to hostname. Kubelt's content addressing builds upon [Benet 2020](#benet-juan-2020) to deliver this capability.

### Content naming

Content addresses change whenever the content from which they are derived changes. It is desirable that content be referred to by a consistent name regardless of its address. For context on the problem space, see [Benet 2020](#benet-juan-2020) for a discussion of IPNS, the naming scheme for IPFS. Kubelt provides a superset of this capability using a key-value store built on the [Hypercore Protocol](https://hypercore-protocol.org/) to share similar cryptographically verifiable names. Kubelt's content naming scheme provides more features, more performantly, while maintaining a peer-to-peer architecture. See _Naming operations_ below.

### Content definition

In order for data to be machine-readable they must be paired with schemas. Schemas are defined using the rich set of extant RDF vocabularies (for example, Google's [Schema.org ontology](https://schema.org/version/latest/schemaorg-current-https.rdf), the [FOG Ontology](https://mathib.github.io/fog-ontology/), the [Data Catalog Vocabulary](https://www.w3.org/TR/vocab-dcat-2/), etc). Schemas are used by the Kubelt SDK to store and retrieve data to and from the distributed graph. See also, for reference, [Berners-Lee 2016](#berners-lee-tim-2016).

### Content availability

On a peer-to-peer network, peers can become unavailable, reducing content availability. It is desirable that the system allow content to be pinned such that certain high-availability peers ensure the content remains available on the network. See _P2P Node_, below.

### Local authentication, authorization, and encryption

web3/distributed contexts defer to users' public-private keys, usually stored in a third-party wallet, to resolve identity and sign/encrypt messages and content. We use this pattern (called KDF) to generate private keys based on a passphrase for account management, encryption, etc. We also use wallet-based keys to offer encryption services for users that remain fully under their control.

### Delegated authentication, authorization, and encryption

For advanced dapp development, Kubelt offers a [Multiformat](https://multiformats.io) extension named _Multiauth_ that encodes auth instructions to peers. This allows them to delegate auth to external systems, particularly blockchains, programmatically. For instance, a dapp that deals with smart contracts can request that a token holder sign a Multiauth message to instruct peers to fetch or update content linked in the token, eliminating blockchain transactions to improve speed and cost efficiency for dapps that require third-party verification.

## Components

The components below are arranged to deliver the desired properties enumerated above.

### CMS Dapp

The CMS Dapp is a distributed application (dapp) that gives users the ability to edit and publish content with a graphical user interface. The CMS Dapp is  implemented using the SDK.

The CMS Dapp serves as a reference implementation for dapp developers, including as a reference for third-party wallet logins, satisfying the property of an appropriate authentication, authorization, and encryption solution.

### CLI

The CLI provides command-line access to the features of the SDK and Kubelt platform. It is intended for fine-grained control and automation for power users (for example, in a data build system).

### SDK

The SDK supports the development of applications that use the Kubelt platform to store and manage content. See the _Framework_ section below for the logical foundation implemented in the SDK.

Software components (such as the CLI, the CMS Dapp, and the P2P Node) have consistent read/write access to the semantic graph through the SDK. The Kubelt semantic graph is distributed over the peer-to-peer network as a quad store on IPFS (the "Inter-Planetary File System") encoded with IPLD ("Inter-Planetary Linked Data"). Locally, Kubelt's semantic graph is materialized for the operations (defined below) as quads.

### P2P Node

The peer-to-peer (P2P) node provides elastic capacity to a distributed application. These nodes provide distributed storage and compute capacity for the dapp.

Nodes can be customized by dapp developers to provide their own services and can be self-hosted. P2P nodes are intended to provide a development framework analogous to Ruby on Rails: an opinionated architecture that organizes common dapp use cases and encapsulates business logic. Optionally, Kubelt will host nodes for developers who want infrastructure support. Dapp users connect to dapp-specific peers preferentially.

Extending the Kubelt P2P Node using this framework model allows dapp developers to publish custom services for their users. These services can be commercialized via a token, as well as host secrets and computations off of client peers. These peers also provide elastic capacity that can be bought and sold on the Kubelt network.

Nodes, including nodes local to users, communicate with each other in the P2P network by emitting and processing events. They also provide content availability (e.g., pinning dapp content).

## Framework

This section defines the logical framework implemented by the components defined above, particularly the SDK.

### Definitions

Let _d_ be a document, for example a [JSON document](https://www.json.org/json-en.html) (rich media, images, etc). Let _r_ be a vocabulary, defined for example using a [RDF Schema](https://www.w3.org/TR/rdf-schema/). Let _q_ be a set of tuples of the form _(subject, predicate, object, label)_, for example [N-Quads](https://www.w3.org/TR/n-quads/), such that each element of the set represents a truth claim expressed in the vocabulary _r_.

Let _f_ be a function, for example a graph database import, that applies _r_ to _d_ to yield _q_.

$$
\begin{equation}
  q = f(d, r)
\end{equation}
$$

Let _g_ be a function, for example a graph database export, that applies _r_ to _q_ to yield _d_.

$$
\begin{equation}
  d = g(q, r)
\end{equation}
$$

Note that, for example, if _q_ is also represented in [JSON format](https://www.w3.org/wiki/JSON_Triple_Sets), then the functions can be composed to yield their inputs:

\begin{equation}
  d = g(f(d, r), r)
\end{equation}

\begin{equation}
  q = f(g(q, r), r)
\end{equation}

Note that the Kubelt model is compatible with the [linked data platform](https://www.w3.org/TR/ldp/) referenced in [Berners-Lee 2016](#berners-lee-tim-2016) and additionally accounts for modern distributed application user interface architectures (in particular direct SPARQL/GraphQL access).

### Data structures

#### The Fat Link Constraint

Recall that the elements of the set _q_, above, are tuples of the form _(subject, predicate, object, label)_. We additionally constrain _object_ elements of tuples such that they cannot refer directly to _subject_ elements. If a reference to a _subject_ element is desired, metadata sufficient to identify the _subject_ is stored instead. This constraint within the Kubelt system, called the _Fat Link constraint_, ensures that all sets _q_ are directed acyclic graphs (DAGs).

#### DAGs

Data are stored on a distributed storage network in DAG format. The _Fat Link constraint_ ensures that any given _q_ is representable as a DAG.

The Kubelt system is designed to operate on DAGs stored within the P2P network. Recall that identities in the network are established cryptographically. For convenience, DAGs can be referred to by a shorthand for their cryptographic identity: the _Me DAG_ is attached to a user's identity (for example, Alice); the _You DAG_ is attached to another user's identity (for example, Bob). These DAGs contain metadata that describe links to content to which the user has access. This level of abstraction is discussed further below.

#### CRDTs

Application events and data stored in DAGs can be structured as conflict-free replicated data types (CRDTs) in order to ensure their strong eventual consistency across the network. For example, a word-processing dapp could emit P2P network events as CRDTs to allow multiplayer document creation.

### Write operations

On a P2P node:

1. Content (_d_) is selected for storage.
1. _d_ is optionally first retrieved using a read operation (see below).
1. A relevant RDF vocabulary is retrieved/selected (_r_).
1. The relevant set of tuples (_q_) is yielded by [Eq. 1](#definitions).
1. Because of the _Fat Link constraint_, _q_ is a DAG. _q_ is now written to the distributed graph.

### Read operations

On a P2P node:

1. The current user's _Me DAG_ is loaded, if necessary (see _Bootstrapping_, below).
1. Desired sets of tuples (_q_) are retrieved from the distributed graph and merged into the local _Me DAG_.
1. Relevant RDF vocabulary is also retrieved (_r_), if necessary (the normal operation of the system automatically caches vocabularies locally).
1. The requested content is yielded by [Eq. 2](#definitions).
1. The user selects content to which they have access by content name, content address, or other link.

### Application events

Peers on the Kubelt network emit and process events to and from one another. The _CMS Dapp_ acts as a reference implementation for this mechanism. This mechanism allows dapp developers to arbitrarily extend the Kubelt network with specialized services.

### Naming operations

Dapp developers can deterministically generate content names using user wallets to materialize encrypted content into the dapp. This enables secure, decentralized user-generated content dapps (e.g., web3 Twitter, web3 Carta, web3 email, etc.).

To generate a content name that manages a single content address (or a root to a collection of addresses) we do the following:

1. Using a user's master key material (deterministically generated at login), sign a user-entered name.
1. Use that signature to seed the generation of a public-private keypair for the name.
1. The resulting keypair is used to generate a new signature and a new name for the content.
1. The content name is published to the Kubelt network.

A naming operation is a particularly important kind of application event (above). Naming operations create consistent names for content addresses that mutate as content changes, allowing content to be referenced without local knowledge of its content address. See [Benet 2020](#benet-juan-2020). Kubelt achieves this using a key-value store built on the [Hypercore Protocol](https://hypercore-protocol.org/).

### Bootstrapping

At login, master key material, _k_, is deterministically generated using seed, _s_, created by hashing a daap-specified message, _m_, with a user-entered passphrase signed by the user's wallet, _p_. The hashing algorithm _h_ can be selected by the daap developer. Let _kfs_ be a function that generates a key from seed.

$$
\begin{equation}
  s = h(p, m)
\end{equation}
$$

$$
\begin{equation}
  k = kfs(s) 
\end{equation}
$$

The master key material is used to discover and retrieve the user's _Me DAG_ from the peer-to-peer network. If the _Me DAG_ does not exist, it is populated with a default set of tuples, including, for example, an index of available RDF vocabularies, pubsub topics, and rendezvous IDs.

Bootstrapping peers allow users to find, create, and name content on the network, as well as other core services. Kubelt, or dapp creators who extend the Kubelt peer node, control bootstrapping directly.

## Discussion

In this section we discuss prototypical scenarios to illustrate the operation of Kubelt.

### Scenarios

1. Alice wants to update a piece of content in her dapp. She uses a wallet to log in to the CMS dapp, selects a named piece
of content, for example the dapp's logo, and uploads a new version.

1. Alice and Bob use a dapp to collaborate on a document.

1. Alice runs custom peer nodes to extend, bootstrap, and scale her dapp.

### Scenario 1: Updating Content

Alice loads a distributed content management application by visiting a URL in a web browser. Legacy web browsers (e.g., Google Chrome, Firefox) will load this application like any other single page application. A web3 shim is included.

Modern web browsers (e.g., Brave) will load this application using its URL scheme, for example using Kubelt, IPNS, ENS, HNS, or other supported distributed naming scheme, or via legacy DNS using [DNSLink](https://docs.ipfs.io/concepts/dnslink/#publish-content-path) records.

Alice then logs in with her crypto wallet, either integrated into a modern browser or as an extension to a legacy browser.

Our security model uses public-private key encryption for authentication and authorization. Cryptographic wallets provide signing and encryption/decryption functions to the local dapp that are used for this capability.

Master key material is generated from the wallet and Alice enters her passphrase. That phrase is signed and the signature is used to seed generation of a public-private keypair. This is done to avoid continuous wallet prompting, enhancing user experience. 

The derived key material is encoded as the content name for Alice's _Me DAG_ and dereferenced using the Kubelt P2P network, yielding a content address. The content at that address is decrypted and merged into Alice's local peer. The _Me DAG_ includes the names of content to which Alice has access. See _Naming operations_ and _Bootstrapping_ for more information.

The contents of the _Me DAG_ are displayed to Alice (via application of [Eq. 2](#definitions)) and she selects the document (or image, 3D object, video, audio file, etc.) that she wants to edit. That document is yielded by the SDK applying [Eq. 2](#definitions) to the relevant part of the _Me DAG_, which also contains links to needed RDF vocabularies.

Alice edits and saves her document.

The contents of the document are decomposed into tuples via the SDK applying [Eq. 1](#definitions) along with the relevant RDF vocabulary. These tuples obey the _Fat Links constraint_ and are representable as a DAG. The SDK attaches this DAG to the _Me DAG_, optionally encrypted, and writes it to Kubelt's distributed graph. Related content names are updated to point to the new content address.

Permissioned consumers of the related content names are now able to view Alice's updated document.

### Scenario 2: Collaboration

Collaboration on Kubelt happens via means of named dedicated change streams (DCSs).

Alice and Bob decide to collaborate on a document with Carol. Alice creates one content name (see _Naming operations_) in her _Me DAG_ for herself and one for each collaborator (in this case, one for Bob and one for Carol). These content names are "named dedicated change streams".

Alice invites collaborators to the document by enveloping the name keypair used to generate the DCS names (i.e., encrypting and signing a message containing this keypair) and sending the name of the envelope to collaborators via each collaborator's dedicated pubsub topic on the Kubelt network. In the message is a content name keypair that is encrypted for each collaborator. Governance and team relationships are implemented by inviting Alice's team and organization in the same way.

Once the envelope is opened, name generation is deterministic such that Bob and Carol can generate consistent content names for each collaborator (i.e., across the complete graph among Alice, Bob, and Carol), in the same way that Alice did, above, for them, in the reverse direction.

Each collaborator, for every change they make, appends a CRDT to each DCS, encrypted with the appropriate public key. These changes are distributed over the Kubelt P2P network. When a collaborator decides to materialize the document, they apply all CRDTs within all of their named dedicated change streams (available by deterministically generating the name of the user's DCS from each collaborator).

Alice now decides to revoke Bob's access to the document. She accomplishes this by writing a deletion CRDT to Bob's DCS and not appending new CRDTs for Bob. Alice then announces a key refresh to collaborators, removing Bob as a collaborator. Bob's peer is not obligated to honour the deletion CRDT (i.e., he can keep a snapshot of the document). The severity of Bob's divergence from the peer network depends on the threat model of individual applications and has several potential remedies (e.g., peer blocking, non-technical remedies, etc.).

This collaboration model is inspired by D. J. Bernstein's [Internet Mail 2000](https://cr.yp.to/im2000.html) proposal. Thus, we refer to this model as _Internet Mail 3000_.

### Scenario 3: Extending and Scaling

Alice decides to scale up peers in the network to serve her dapp content and provide users with distributed compute resources. She knows that Kubelt provides a peer formation configuration dapp that will allow her to buy and sell peer network capacity (see _Tokenomics_, below). Alice wants to maintain fine-grained control of her dapp peers and so decides to manage them herself.

Alice extends the Kubelt peer reference implementation to add message types and services specific to her dapp. She does this by adjusting configuration and schema files and implementing service handlers for her messages. Alice then runs the peer on her own hardware or in a hosting environment.

A user of Alice's dapp who connects to the peer network is now able to peer with Alice's nodes. This enhances Alice's user's experience by improving the availability of content and providing the ability to offload compute services to peers. This is accomplished using a rendezvous protocol, allowing peers to discover each other over the network without central coordination and Alice's users to preferentially connect to her nodes.

Doing so, Alice extends the Kubelt network with her own custom services while also adding capacity for storage and other Kubelt-provided services.

## Tokenomics

We anticipate using a token to clear the supply and demand market created by the Kubelt P2P network. For example, allowing dapp developers to buy and sell network capacity (peers), monetize the custom services they add, and pay for services like content pinning, search indexing, advertising, etc.

## Conclusion

[Kubelt](https://kubelt.com) is the web3 CMS, built on top of a peer-to-peer distributed semantic graph. It provides a straightforward content management capability familiar to web developers that is native to web3, with extensions into a distributed application development platform.

[Please get in touch](mailto:alex@kubelt.com) with questions and suggestions!

## Bibliography

### Benet, Juan. 2020.
[IPFS - Content Addressed, Versioned, P2P File System (DRAFT 3)](https://ipfs.io/ipfs/bafybeibjevkcernyjeigpgg3ir2pztybwntib3eiynjzteupzcq324ctzq/ipfs.draft3.pdf)

### Berners-Lee, Tim. 2016.
[Solid: A Platform for Decentralized Social Applications Based on Linked Data](http://emansour.com/research/lusail/solid_protocols.pdf)
