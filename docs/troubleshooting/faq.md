---
description: Frequently Asked Questions for the Rollup project.
---

# FAQ

## Do you create a wallet for the user? Or just facilitate logging in with existing wallets?

We allow either. Users can bring their own wallet or developers can provision one for them. We call this a **dedicated vault**.

## How are those vault wallets managed? Is there an API for developers to take actions (for example, signing) on behalf of the user?

Developers add a dedicated vault scope to their apps in [Console](https://passport.rollup.id/). When users connect they authorize the creation of a new single-purpose private key, shared between them and the developer.

would help improve the UX if a local session was always available. This is optional (opt in) since any authentication service, including existing wallets, will work.

This is great for use cases like gaming and metaverse where the user may want to authorize additional developers to use their account. Since all parties have permissioned, controlled access to the private key they can all transact with the account in isolation.

## Who owns the user?

Users own their own identity. Only their identity factors (or third-parties the user has authorized with scoped tokens) can authenticate and interact with their identity nodes within the graph. The user has a separate identity and applications are connecting _to_ that identity.

## Can Developers **White-label** Rollup?

Yes, we support developers using their own custom domain names (CNAMEs), certificates, and their own brand assets.

## How exactly does the sign-in mechanism work? Is it OAuth?

It is identical to OAuth. In terms of the standard “legs” of the OAuth 2.0 standard, developers are able to request users authorize them to resources connected to the Rollup graph. These resources are things like (as above) dedicated vaults, JSON object storage, user profile data, resources defined by developers, etc.

Users authenticate to the identity graph and grant developer applications authorizations to these decentralized resources.

<aside>
💡 Any identity factor (for example, a social login) is a node in the Rollup graph, as are all connected services (OAuth ”resources”). These identity factors are analogous to DNS resolvers that point to unique user identities. Traversals across, and access to, nodes in the graph require appropriate authorization scopes.
</aside>

## How do I configure my OAuth settings?

Developers use [Console](https://passport.rollup.id) to configure their application settings. Our standards-compliant version of OAuth with extensions to support the decentralized identity graph is called **0xAuth**.

![console.png](../img/console-app-0xauth.png)

## How does the user authenticate? Is it a standard web3 sign-in process or can they just sign up for an account and login?

Users’ choice! They can use social logins (Google, Twitter, etc.), their own wallet (SIWE), or an emaill address. No wallet needed, developers just request an authorization scope and a single-purpose account (a **dedicated vault**) will be created automatically!

## How do applications know about and connect to the account?

Applications get a JWT with a scope to a single-purpose account once they ask for it and the user authorizes them. The application can interact with the account with RPC calls and request for their own internal systems (for example, using the identifiers in the JWT as their user IDs).
