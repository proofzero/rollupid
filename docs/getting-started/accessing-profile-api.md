---
description: Using Galaxy to access the user profile graph.
---

# Accessing Profile API

With the access token received in the [previous step ](auth-flow.md)we can now make authorized requests to the Profile API.&#x20;

The[ Profile API ](broken-reference)is a GraphQL API that is reachable at [https://galaxy.threeid.xyz/](https://galaxy.threeid.xyz/). You can use GraphQL codegen tools to include our GQL schemas in your GraphQL client.&#x20;

To call the API you will need to include the [Galaxy API key](create-an-application.md) from your app and sometime the signed JWT / access token.

The full API reference documentation can be found [here](../reference/galaxy-api.md).
