---
description: A conceptual introduction to 3ID.
---

3ID helps developers onboard users quickly and effectively. It's organized
around several components. Before discussing those components ([Profile](#profile),
[Passport](#passport), [Console](#console), and [Galaxy](#galaxy)) we'll briefly
discuss the underlying technical architecture.

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
graph, however, interactions with the graph are through well-defined interfaces:
your team will be defining scopes in [Console](../console/reference.md#scopes)
and making GraphQL calls through [Galaxy](../galaxy/index.md), not doing edge
and node operations.

We'll now move on to discussing the system compoents built on top of the
Authorization Graph and what they do for you.

## Profile

[Profile](../profile/index.md) is a decentralized user profile that developers
use to personalize their UX. With Profile you can give users a profile picture
and display name of their choice, and more, all with one API call.

## Passport

[Passport](../passport/index.md) is 3ID's authentication and authorization system.

## Console

[Console](../console/index.md) is where developers create **0xAuth** apps.

## Galaxy

[Galaxy](../galaxy/index.md) is 3ID's GraphQL system.


