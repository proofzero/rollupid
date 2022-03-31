---
title: "Kubelt Cores Whitepaper"
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

A semantic graph is a data structure that encodes relationships between data points. This lets us add a layer of meaning to the data stored on web3. We can, for instance, tell that a content address like \emph{bafyreiabc123} is actually, for example, the first frame of a video, the configuration for a metaverse object, localized UI text, etc.

The system enables sharing of arbitrary data, including without limitation text, images, rich media, executable objects (e.g., WASM), metadata, etc. All of this is stored in a graph distributed over a peer-to-peer network.

The system supports layers for conflict resolution, strong eventual consistency, corporate governance, encryption at rest and in transit, support for encryption at compute (i.e., homomorphic, secure multiparty computation, etc.), and other layers.

Security is further enhanced through standard third-party authentication methods, out-of-band key verification, user ownership of data, and logical and physical network partitions.

$$
\section{Desired Properties}

\begin{itemize}
\item \emph{Content delivery}: it is desirable that graph content be shared over a peer-to-peer network both to reduce system cost and to affect a distributed/decentralized architecture. Kubelt delivers this capability.
\bigskip
\item \emph{Content addressing}: in a distributed system, it is desirable that content be consistently addressable and without reference to hostname. Kubelt's content addressing builds upon \cite{Benet:2020dg} to deliver this capability.
\bigskip
\item \emph{Content naming}: content addresses change whenever the content from which they are derived changes. It is desirable that content be referred to by a consistent name regardless of its address. For context on the problem space, see \cite{Benet:2020dg} for a discussion of IPNS, the naming scheme for IPFS. Kubelt provides a superset of this capability using a key-value store built on the \href{https://hypercore-protocol.org/}{Hypercore Protocol} to share similar cryptographically verifiable names. Kubelt's content naming scheme provides more features, more performantly, while maintaining a peer-to-peer architecture. See \emph{Naming operations} below.
\bigskip
\item \emph{Content definition}: In order for data to be machine-readable they must be paired with schemas. Schemas are defined using the rich set of extant RDF vocabularies (for example, Google's \href{https://schema.org/version/latest/schemaorg-current-https.rdf}{Schema.org ontology}, the \href{https://mathib.github.io/fog-ontology/}{FOG Ontology}, the \href{https://www.w3.org/TR/vocab-dcat-2/}{Data Catalog Vocabulary}, etc). Schemas are used by the Kubelt SDK to store and retrieve data to and from the distributed graph. See also, for reference, \cite{TBL:2016dg}.
\bigskip
\item \emph{Content availability}: On a peer-to-peer network, peers can become unavailable, reducing content availability. It is desirable that the system allow content to be pinned such that certain high-availability peers ensure the content remains available on the network. See \emph{P2P Node}, below.
\bigskip
\item \emph{Local authentication, authorization, and encryption}: web3/distributed contexts defer to users' public-private keys, usually stored in a third-party wallet, to resolve identity and sign/encrypt messages and content. We use this pattern (called KDF) to generate private keys based on a passphrase for account management, encryption, etc. We also use wallet-based keys to offer encryption services for users that remain fully under their control.
\bigskip
\item \emph{Delegated authentication, authorization, and encryption}: for advanced dapp development, Kubelt offers a \href{https://multiformats.io}{Multiformat} extension named \emph{Multiauth} that encodes auth instructions to peers. This allows them to delegate auth to external systems, particularly blockchains, programmatically. For instance, a dapp that deals with smart contracts can request that a token holder sign a Multiauth message to instruct peers to fetch or update content linked in the token, eliminating blockchain transactions to improve speed and cost efficiency for dapps that require third-party verification.
\end{itemize}

\section{Components}

The components below are arranged to deliver the desired properties enumerated above.

\subsection{CMS Dapp}

The CMS Dapp is a distributed application (dapp) that gives users the ability to edit and publish content with a graphical user interface. For a reference implementation, see \href{https://sanity.io}{Sanity Studio}. The CMS Dapp is (and Sanity Studio integrations are) implemented using the SDK.

The CMS Dapp serves as a reference implementation for dapp developers, including as a reference for third-party wallet logins, satisfying the property of an appropriate authentication, authorization, and encryption solution.

\subsection{CLI}

The CLI provides command-line access to the features of the SDK and Kubelt platform. It is intended for fine-grained control and automation for power users (for example, in a data build system).

\subsection{SDK}

The SDK supports the development of applications that use the Kubelt platform to store and manage content. See the \emph{Framework} section below for the logical foundation implemented in the SDK.

Software components (such as the CLI, the CMS Dapp, and the P2P Node) have consistent read/write access to the semantic graph through the SDK. The Kubelt semantic graph is distributed over the peer-to-peer network as a quad store on IPFS (the "Inter-Planetary File System") encoded with IPLD ("Inter-Planetary Linked Data"). Locally, Kubelt's semantic graph is materialized for the operations (defined below) as quads.

\subsection{P2P Node}

The peer-to-peer (P2P) node provides elastic capacity to a distributed application. These nodes provide distributed storage and compute capacity for the dapp.

Nodes can be customized by dapp developers to provide their own services and can be self-hosted. P2P nodes are intended to provide a development framework analogous to Ruby on Rails: an opinionated architecture that organizes common dapp use cases and encapsulates business logic. Optionally, Kubelt will host nodes for developers who want infrastructure support. Dapp users connect to dapp-specific peers preferentially.

Extending the Kubelt P2P Node using this framework model allows dapp developers to publish custom services for their users. These services can be commercialized via a token, as well as host secrets and computations off of client peers. These peers also provide elastic capacity that can be bought and sold on the Kubelt network.

Nodes, including nodes local to users, communicate with each other in the P2P network by emitting and processing events. They also provide content availability (e.g., pinning dapp content).

\section{Framework}

This section defines the logical framework implemented by the components defined above, particularly the SDK.

\subsection{Definitions}

Let \emph{d} be a document, for example a \href{https://www.json.org/json-en.html}{JSON document} (rich media, images, etc). Let \emph{r} be a vocabulary, defined for example using a \href{https://www.w3.org/TR/rdf-schema/}{RDF Schema}. Let \emph{q} be a set of tuples of the form \emph{(subject, predicate, object, label)}, for example \href{https://www.w3.org/TR/n-quads/}{N-Quads}, such that each element of the set represents a truth claim expressed in the vocabulary \emph{r}.

Let \emph{f} be a function, for example a graph database import, that applies \emph{r} to \emph{d} to yield \emph{q}.

\begin{equation}
\label{eq:qdr}
q = f(d, r)
\end{equation}

Let \emph{g} be a function, for example a graph database export, that applies \emph{r} to \emph{q} to yield \emph{d}.

\begin{equation}
\label{eq:dqr}
d = g(q, r)
\end{equation}

Note that, for example, if \emph{q} is also represented in \href{https://www.w3.org/wiki/JSON_Triple_Sets}{JSON format}, then the functions can be composed to yield their inputs:

\begin{equation}
\label{eq:cmp1}
d = g(f(d, r), r)
\end{equation}

\begin{equation}
\label{eq:cmp2}
q = f(g(q, r), r)
\end{equation}

Note that the Kubelt model is compatible with the \href{https://www.w3.org/TR/ldp/}{linked data platform} referenced in \cite{TBL:2016dg} and additionally accounts for modern distributed application user interface architectures (in particular direct SPARQL/GraphQL access).

\subsection{Data structures}

\begin{itemize}
\item \emph{The Fat Link constraint}: Recall that the elements of the set \emph{q}, above, are tuples of the form \emph{(subject, predicate, object, label)}. We additionally constrain \emph{object} elements of tuples such that they cannot refer directly to \emph{subject} elements. If a reference to a \emph{subject} element is desired, metadata sufficient to identify the \emph{subject} is stored instead. This constraint within the Kubelt system, called the \emph{Fat Link constraint}, ensures that all sets \emph{q} are directed acyclic graphs (DAGs).
\bigskip
\item \emph{DAGs}: Data are stored on a distributed storage network in DAG format. The \emph{Fat Link constraint} ensures that any given \emph{q} is representable as a DAG.
%Kubelt  on IPFS using \href{https://ipld.io/}{IPLD} (see also \cite{Benet:2020dg}) in order to achieve the desired properties (enumerated above). IPLD requires that data be arranged in a directed acyclic graph (DAG).
The Kubelt system is designed to operate on DAGs stored within the P2P network. Recall that identities in the network are established cryptographically. For convenience, DAGs can be referred to by their cryptographic identity: the \emph{Me DAG} is attached to a user's identity (for example, Alice); the \emph{You DAG} is attached to another user's identity (for example, Bob). These DAGs contain metadata that describe links to content to which the user has access. This level of abstraction is discussed further below.
%; the \emph{"We" DAG} is attached to a group/team identity (for example, a multikey identity composed from Alice and Bob's identities); the \emph{"Doc" DAG}, similar to the \emph{"We" DAG}, is a DAG representing a standalone piece of content (for example, a public unencrypted dataset).
\bigskip
\item \emph{CRDTs}: Application events and data stored in DAGs can be structured as conflict-free replicated data types (CRDTs) in order to ensure their strong eventual consistency across the network. For example, a word-processing dapp could emit P2P network events as CRDTs to allow multiplayer document creation.
\end{itemize}

\subsection{Write operations}

On a P2P node:

\begin{enumerate}

\item Content (\emph{d}) is nominated for storage. It is optionally first retrieved using a read operation (see below).
\item A relevant RDF vocabulary is retrieved/selected (\emph{r}).
\item The relevant set of tuples (\emph{q}) is yielded by Eq. \ref{eq:qdr}.
\item Because of the \emph{Fat Link constraint}, \emph{q} is a DAG. \emph{q} is now written to the distributed graph.

\end{enumerate}

\subsection{Read operations}

On a P2P node:

\begin{enumerate}

\item The current user's \emph{Me DAG} is loaded, if necessary (see \emph{Bootstrapping}, below).
\item The user selects content to which they have access by content name, content address, or other link.
\item Desired sets of tuples (\emph{q}) are retrieved from the distributed graph and merged into the local \emph{Me DAG}.
\item Relevant RDF vocabulary is also retrieved (\emph{r}), if necessary (the normal operation of the system automatically caches vocabularies locally).
\item The requested content is yielded by Eq. \ref{eq:dqr}.

\end{enumerate}

\subsection{Application events}

Peers on the Kubelt network emit and process events to and from one another. The \emph{CMS Dapp} acts as a reference implementation for this mechanism. This mechanism allows dapp developers to arbitrarily extend the Kubelt network with specialized services.

\subsection{Naming operations}

Dapp developers can deterministically generate content names using user wallets to materialize encrypted content into the dapp. This enables secure, decentralized user-generated content dapps (e.g., web3 Twitter, web3 Carta, web3 email, etc.).

To generate a content name that manages a single content address (or a root to a collection of addresses) we do the following:

\begin{enumerate}
\item Using a user's master key material (deterministically generated at login), sign a user-entered name.
\item Use that signature to seed the generation of a public-private keypair for the name.
\item The resulting keypair is used to generate a new signature and a new name for the content.
\item The content name is published to the Kubelt network.
\end{enumerate}

A naming operation is a particularly important kind of application event (above). Naming operations create consistent names for content addresses that mutate as content changes, allowing content to be referenced without local knowledge of its content address. See \cite{Benet:2020dg}. Kubelt achieves this using a key-value store built on the \href{https://hypercore-protocol.org/}{Hypercore Protocol}.

\subsection{Bootstrapping}

At login, master key material, \emph{k}, is deterministically generated using seed, \emph{s}, created by hashing a daap-specified message, \emph{m}, with a user-entered passphrase signed by the user's wallet, \emph{p}. The hashing algorithm \emph{h} can be selected by the daap developer. Let \emph{kfs} be a function that generates a key from seed.

\begin{equation}
\label{eq:s}
s = h(p, m)
\end{equation}

\begin{equation}
\label{eq:kfs}
k = kfs(s) 
\end{equation}

The master key material is used to discover and retrieve the user's \emph{Me DAG} from the peer-to-peer network. If the \emph{Me DAG} does not exist, it is populated with a default set of tuples, including, for example, an index of available RDF vocabularies, pubsub topics, and rendezvous IDs.

Bootstrapping peers allow users to find, create, and name content on the network, as well as other core services. Kubelt, or dapp creators who extend the Kubelt peer node, control bootstrapping directly.

\section{Discussion}

In this section we discuss prototypical scenarios to illustrate the operation of Kubelt.

\subsection{Scenarios}

\begin{enumerate}

\item Alice wants to update a piece of content in her dapp. She uses a wallet to log in to the CMS dapp, selects a named piece
of content, for example the dapp's logo, and uploads a new version.

\item Alice and Bob use a dapp to collaborate on a document.

\item Alice runs custom peer nodes to extend, bootstrap, and scale her dapp.

\end{enumerate}

\subsection{Scenario 1: Updating Content}

Alice loads a distributed content management application by visiting a URL in a web browser. Legacy web browsers (e.g., Google Chrome, Firefox) will load this application like any other single page application. A web3 shim is included.

Modern web browsers (e.g., Brave) will load this application using its URL scheme, for example using Kubelt, IPNS, ENS, HNS, or other supported distributed naming scheme, or via legacy DNS using \href{https://docs.ipfs.io/concepts/dnslink/#publish-content-path}{DNSLink} records.

Alice then logs in with her crypto wallet, either integrated into a modern browser or as an extension to a legacy browser.

Our security model uses public-private key encryption for authentication and authorization. Cryptographic wallets provide signing and encryption/decryption functions to the local dapp that are used for this capability.

Master key material is generated from the wallet and Alice enters her passphrase. That phrase is signed and the signature is used to seed generation of a public-private keypair. This is done to avoid continuous wallet prompting, enhancing user experience. 

The derived key material is encoded as the content name for Alice's \emph{Me DAG} and dereferenced using the Kubelt P2P network, yielding a content address. The content at that address is decrypted and merged into Alice's local peer. The \emph{Me DAG} includes the names of content to which Alice has access. See \emph{Naming operations} and \emph{Bootstrapping} for more information.

The contents of the \emph{Me DAG} are displayed to Alice (via application of Eq. \ref{eq:dqr}) and she selects the document (or image, 3D object, video, audio file, etc.) that she wants to edit. That document is yielded by the SDK applying Eq. \ref{eq:dqr} to the relevant part of the \emph{Me DAG}, which also contains links to needed RDF vocabularies.

Alice edits and saves her document.

The contents of the document are decomposed into tuples via the SDK applying Eq. \ref{eq:qdr} along with the relevant RDF vocabulary. These tuples obey the \emph{Fat Links constraint} and are representable as a DAG. The SDK attaches this DAG to the \emph{Me DAG}, optionally encrypted, and writes it to Kubelt's distributed graph. Related content names are updated to point to the new content address.

Permissioned consumers of the related content names are now able to view Alice's updated document.

\subsection{Scenario 2: Collaboration}

Collaboration on Kubelt happens via means of named dedicated change streams (DCSs).

Alice and Bob decide to collaborate on a document with Carol. Alice creates one content name (see \emph{Naming operations}) in her \emph{Me DAG} for herself and one for each collaborator (in this case, one for Bob and one for Carol). These content names are "named dedicated change streams".

Alice invites collaborators to the document by enveloping the name keypair used to generate the DCS names (i.e., encrypting and signing a message containing this keypair) and sending the name of the envelope to collaborators via each collaborator's dedicated pubsub topic on the Kubelt network. In the message is a content name keypair that is encrypted for each collaborator. Governance and team relationships are implemented by inviting Alice's team and organization in the same way.

Once the envelope is opened, name generation is deterministic such that Bob and Carol can generate consistent content names for each collaborator (i.e., across the complete graph among Alice, Bob, and Carol), in the same way that Alice did, above, for them, in the reverse direction.

Each collaborator, for every change they make, appends a CRDT to each DCS, encrypted with the appropriate public key. These changes are distributed over the Kubelt P2P network. When a collaborator decides to materialize the document, they apply all CRDTs within all of their named dedicated change streams (available by deterministically generating the name of the user's DCS from each collaborator).

Alice now decides to revoke Bob's access to the document. She accomplishes this by writing a deletion CRDT to Bob's DCS and not appending new CRDTs for Bob. Alice then announces a key refresh to collaborators, removing Bob as a collaborator. Bob's peer is not obligated to honour the deletion CRDT (i.e., he can keep a snapshot of the document). The severity of Bob's divergence from the peer network depends on the threat model of individual applications and has several potential remedies (e.g., peer blocking, non-technical remedies, etc.).

This collaboration model is inspired by D. J. Bernstein's \href{https://cr.yp.to/im2000.html}{Internet Mail 2000} proposal. Thus, we refer to this model as \emph{Internet Mail 3000}.

\subsection{Scenario 3: Extending and Scaling}

Alice decides to scale up peers in the network to serve her dapp content and provide users with distributed compute resources. She knows that Kubelt provides a peer formation configuration dapp that will allow her to buy and sell peer network capacity (see \emph{Tokenomics}, below). Alice wants to maintain fine-grained control of her dapp peers and so decides to manage them herself.

Alice extends the Kubelt peer reference implementation to add message types and services specific to her dapp. She does this by adjusting configuration and schema files and implementing service handlers for her messages. Alice then runs the peer on her own hardware or in a hosting environment.

A user of Alice's dapp who connects to the peer network is now able to peer with Alice's nodes. This enhances Alice's user's experience by improving the availability of content and providing the ability to offload compute services to peers. This is accomplished using a rendezvous protocol, allowing peers to discover each other over the network without central coordination and Alice's users to preferentially connect to her nodes.

Doing so, Alice extends the Kubelt network with her own custom services while also adding capacity for storage and other Kubelt-provided services.

\section{Tokenomics}

We anticipate using a token to clear the supply and demand market created by the Kubelt P2P network. For example, allowing dapp developers to buy and sell network capacity (peers), monetize the custom services they add, and pay for services like content pinning, search indexing, advertising, etc.

\section{Conclusion}

\href{https://kubelt.com}{Kubelt} is the web3 CMS, built on top of a peer-to-peer distributed semantic graph. It provides a straightforward content management capability familiar to web developers that is native to web3, with extensions into a distributed application development platform.

\href{mailto:alex@kubelt.com}{Please get in touch} with questions and suggestions!

%----------------------------------------------------------------------------------------
%	REFERENCE LIST
%----------------------------------------------------------------------------------------

\begin{thebibliography}{99} % Bibliography - this is intentionally simple in this template

\bibitem[Benet, 2020]{Benet:2020dg}
Benet, Juan. 2020.
\newblock IPFS - Content Addressed, Versioned, P2P File System (DRAFT 3)
\newblock {\em ipfs.io}, \href{https://ipfs.io/ipfs/bafybeibjevkcernyjeigpgg3ir2pztybwntib3eiynjzteupzcq324ctzq/ipfs.draft3.pdf}{direct download}.

\bibitem[Berners-Lee, 2016]{TBL:2016dg}
\newblock Solid: A Platform for Decentralized Social Applications Based on Linked Data
\newblock {\em emansour.com}, \href{http://emansour.com/research/lusail/solid_protocols.pdf}{direct download}.
 
\end{thebibliography}

%----------------------------------------------------------------------------------------

\end{document}
$$