---
description: GraphQL API Docs
---

# Galaxy GQL API

Access to Galaxy is served up by a GraphQL (GQL) API at [https://galaxy.rollup.id](https://galaxy.rollup.id)

## Setup Guide

There are several ways you can consume GQL APIs and we've documented how below. If you are interested in a deeper understanding of GraphQL you can visit the [GraphQL documentation portal.](https://graphql.org/learn/)

### Option 1: Simple Fetch Client

A simple fetch client is the fastest way to consume a GQL API if you are not using GQL anywhere else in your application since this method requires no new dependencies.

Here is a simple example of using fetch with Galaxy.

```typescript
const query = `query getProfile() {
  profile {
    displayName
    pfp
  }
}

const { profile } = fetch("https://galaxy.rollup.id", {
  method: "post",
  headers: {
    
  },
  body: JSON.stringify({ query }),
})
  .then(r => r.json())
  .catch(err => {
    console.error(err) // something went wrong
    return { profile: null }
  })
```

In this example we are calling the Galaxy "profile" resolver and asking it to return two fields.

Here is the same operation but with two resolvers this time:

```typescript
const query = `query getProfile() {
  profile {
    displayName
    pfp
  }
  gallery {
    contract
    tokenId
  }
}

const { profile } = fetch("https://galaxy.rollup.id", {
  method: "post",
  headers: {
    
  },
  body: JSON.stringify({ query }),
})
  .then(r => r.json())
  .then(data => {
    return {
      ...data.profile,
      gallery
   }
  })
  .catch(err => {
    console.error(err) // something went wrong
    return { profile: null }
  })
```

In this example get two responses. One from "profile" and one from "gallery. Then we merge the response into one profile object.\
\
And here is one more example operation with variables:

```typescript
const query = `query getProfileFromAddress($type, $address) {
  profile: profileFromAddress(type: $type, address: $address) {
    displayName
    pfp
  }
}

const { profile } = fetch("https://galaxy.rollup.id", {
  method: "post",
  headers: {
    
  },
  body: JSON.stringify({
    query,
    variables: {
      type: "eth",
      address: "vitalik.eth"
    }
  }),
})
  .then(r => r.json())
  .catch(err => {
    console.error(err) // something went wrong
    return { profile: null }
  })
```

### Option 2: GraphQL Clients

TODO

### Option 3: GraphQL Generator

TODO

## Definitions

TODO

## Resolvers

TODO
