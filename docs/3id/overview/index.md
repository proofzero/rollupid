---
description: A conceptual introduction to 3ID.
---

3ID helps developers onboard users quickly and effectively. It's organized
around several components. First we'll discuss those components ([Profile](#profile),
[Passport](#passport), [Console](#console), and [Galaxy](#galaxy)) and then we'll
briefly discuss the underlying technical architecture.

## Profile

Users expect personalized experiences. [Profile](../profile/index.md) gives your
users a profile picture, cover photo, display name of their choice, and a lot
more, all with one simple API call.

## Passport

[Passport](../passport/index.md) makes it easy to get users into your
application safely and securely with the traditional, social, and crypto logins
that make them most comfortable. No matter how those users connect you get
one, unified view of their data: social logins can provision social wallets,
crypto users can share their emails, and everyone can get an updated KYC profile.

## Console

Create your 3ID applications in [Console](../console/index.md), where you can
define standard OAuth application settings, set up white labelling to make the
Passport experience yours, and get analytics on your users.

## Galaxy

[Galaxy](../galaxy/index.md) is 3ID's GraphQL system.

## The Authorization Graph

All 3ID components are different configurations of, or views on, the same
underlying structure: an immensely power graph of decentralized edge computing
resources.

For example, a user is able to connect multiple social and blockchain accounts
to their 3ID Profile because, under the hood, these are represented as different
[nodes](glossary.md#nodes) in the underlying graph.

Authorizations are baked into the fundamental structures of this graph, which
means traversals and data accesses are always **secure**. The structure of the
graph is tightly controlled, which means that accesses are always **fast**.

It might be useful to understand that you are working on top of a decentralized
graph, however, interactions with the graph are through well-defined interfaces
represented by the components of the system. You will be defining scopes
in [Console](../console/reference.md#scopes), making GraphQL calls through
[Galaxy](../galaxy/index.md), and personalizing your UX with
[Profile](../profile/reference.md), not wrangling complex graph operations.
