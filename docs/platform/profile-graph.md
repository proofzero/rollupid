---
description: Decentralized Profile Graph with Connected Services
---

# Galaxy

### Overview

[Galaxy API ](../reference/galaxy-api.md)is a versatile interface that enables developers to traverse the Rollup ID graph using their application API keys paired with user-issued access tokens. It provides both GraphQL and REST endpoints, allowing developers to choose the best approach to interact with the decentralized profile graph and perform various operations.

#### Key Features

* **GraphQL API:** The Galaxy GraphQL API allows developers to make flexible and efficient queries, enabling them to request precisely the data they need, reducing the amount of over- or under-fetching.
* **REST API (coming soon):** The Galaxy REST API offers developers a more familiar and straightforward way to interact with the Rollup ID graph using standard HTTP methods.
* **Authorization:** Developers must use their application API keys paired with user-issued access tokens to access the Galaxy API, ensuring secure and authorized access to the graph.
* **Graph Traversal:** Galaxy API enables developers to traverse the graph, interacting with nodes and edges while adhering to the authorization constraints set by the user.

### Using the Galaxy API

#### Authentication

To authenticate with the Galaxy API, developers must use their application API keys and user-issued access tokens. These tokens ensure that only authorized applications can access the graph, and only with the specific permissions granted by the user.

#### Making Requests

Developers can make requests to the Galaxy API using either the GraphQL or REST endpoints:

1. **GraphQL Requests:** Developers can send GraphQL queries and mutations to the GraphQL endpoint, allowing them to fetch or modify data efficiently.
2. **REST Requests:** Developers can use standard HTTP methods (GET, POST, PUT, DELETE) to interact with the REST API endpoints, providing a more familiar approach to working with the Rollup ID graph.

#### Traversing the Graph

Using the Galaxy API, developers can traverse the Rollup ID graph by making requests to access and interact with nodes and edges. These interactions are subject to the access tokens issued by the user, ensuring that developers can only access the specific data and relationships permitted by the user.

To traverse the graph, developers can use the Uniform Resource Name (URN) format from [RFC 8141](https://www.rfc-editor.org/rfc/rfc8141) to resolve nodes on the graph. For example, `urn:rollup:account/abc123` tells us that within the "rollup" domain, get the "profile" node with the namespace id "abc123".

