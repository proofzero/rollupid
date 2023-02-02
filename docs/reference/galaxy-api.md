---
description: GraphQL API Docs
---

# Galaxy GQL API

Access to Galaxy is served up by a GraphQL (GQL) API at [https://galaxy.rollup.id](https://galaxy.rollup.id)

## Setup Guide

There are several ways you can consume GQL APIs and we've documented how below. If you are interested in a deeper understanding of GraphQL you can visit the [GraphQL documentation portal.](https://graphql.org/learn/)

{% hint style="info" %}
For these example we are using Javascript but you would be able to achieve similar results with your preferred language.
{% endhint %}

{% tabs %}
{% tab title="1. Simple Fetch" %}
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
    "Authorization": "Bearer: ${jwt}",
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
    "Authorization": "Bearer: ${jwt}",
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
    "Authorization": "Bearer: ${jwt}",
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
{% endtab %}

{% tab title="2. GQL Client" %}
### Option 2: GraphQL Clients

Another option is to use a general purpose GQL Client. One such client we recommend for Javascript is [graphql-request.](https://www.npmjs.com/package/graphql-request)

GraphQL Request helps reduce the overhead of making GQL API calls with a simple fetch. Let's demonstrate the same examples in Option 1 with this library.

First we setup a client:

```typescript
const client = new GraphQLClient(endpoint, { 
    headers: {
      "Authorization": "Bearer: ${jwt}",
    } 
})
```

Then we can do the single operation request:

<pre class="language-typescript"><code class="lang-typescript"><strong>const query = `query getProfile() {
</strong>  profile {
    displayName
    pfp
  }
}

const { profile } = client.request(query)
</code></pre>

Just like in Option 1, in this example we are calling the Galaxy "profile" resolver and asking it to return two fields.

Let's do the same but with two resolvers this time:

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

const { profile } = client.request(query).then(data => {
  return {
    ...data.profile,
    gallery
  }
})
```

Again, just like in Option 1, in this example get two responses. One from "profile" and one from "gallery. Then we merge the response into one profile object.\
\
And finally, one more example operation with variables:

```typescript
const query = `query getProfileFromAddress($type, $address) {
  profile: profileFromAddress(type: $type, address: $address) {
    displayName
    pfp
  }
}

const { profile } = client.request(query, {
  type: "eth",
  address: "vitalik.eth"
})
```

As you can see, with a GraphQL client lines the overhead of making API calls is greatly reduced.
{% endtab %}

{% tab title="3. GQL Codegen" %}
### Option 3: GraphQL Generator
{% endtab %}
{% endtabs %}





## Definitions

TODO

## Resolvers

TODO
