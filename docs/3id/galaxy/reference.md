---
description: Galaxy Reference
---

# Galaxy

Galaxy is 3ID's GraphQL system. Supported types for queries are documented below.

## `address` GraphQL Type

The `address` GraphQL type represents an Ethereum address. It has the following fields:

### `ensDisplayName(addressOrEns: String!)`

This field returns the ENS (Ethereum Name Service) display name for a given Ethereum address or ENS name.

Input:

* `addressOrEns`: A string representing an Ethereum address or ENS name.

Output:

* A string representing the ENS display name for the given Ethereum address or ENS name.

### `ensAddress(addressOrEns: String!)`

This field returns the Ethereum address associated with a given ENS name.

Input:

* `addressOrEns`: A string representing an Ethereum address or ENS name.

Output:

A string representing the Ethereum address associated with the given ENS name.

### `ensAddressAvatar(addressOrEns: String!)`

This field returns the avatar URL for a given Ethereum address or ENS name.

Input:

`addressOrEns`: A string representing an Ethereum address or ENS name.

Output:

A string representing the avatar URL for the given Ethereum address or ENS name.

*Note: The `address` GraphQL type is only available in the context of a GraphQL query. It is not intended to be used as an input type in a GraphQL mutation.*

## `URN` GraphQL Type

`URN` is a common type used across all the others. Consider it a primitive within Galaxy.

The `URN` type represents a Uniform Resource Name (URN). It is a string that identifies a resource, particularly an account, in a way that is both unique and persistent, even if the resource's location changes or it becomes unavailable.

