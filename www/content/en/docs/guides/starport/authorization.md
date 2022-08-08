---
title: "🔒Authorization"
description: ""
lead: ""
date: 2022-07-28T21:48:58-04:00
lastmod: 2022-07-28T21:48:58-04:00
images: []
menu:
  docs:
    parent: "starport"
weight: 999
toc: true
---

### 🔒Authorization Guide

Kubelt applications authorize access to RPC methods and UI with "claims". Claims are associated with wallet addresses and indicate the permissions granted to the owner of that wallet.

### Getting Claims

#### Unauthenticated Request

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_getCoreClaims",
  "params": ["3id.access"]
}
```

#### Unauthenticated Response

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_getCoreClaims",
  "params": ["3id.access"]
}
```

#### Authenticated Request

```
POST :host/@:core/jsonrpc
KBT-Access-JWT-Assertion: :jwt
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_getCoreClaims",
  "params": ["3id.access"]
}
```

#### Authenticated Response

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "kb_getCoreClaims",
  "result": ["3id.access"]
}
```

### List of Claims

Under development. [Join our Discord](https://discord.gg/UgwAsJf6C5) to talk to us about what claims you can use right now.

### Testing Claims in your Dapp

Once you retrieve the claims associated with a wallet you can test them in code directly:

```javascript
  const { result } = await kubelt.send('kb_getCoreClaims')
  if (!result.indexOf("3id.access") > -1) return

  // We know we have access to 3id here.
```

They are also inspectable via SDK methods (docs coming soon).

### Adding Custom Claims

You can gate access to parts of your application by creating custom claims. Access to this will be via Starbase, however you can [join our Discord](https://discord.gg/UgwAsJf6C5) to request beta access.

### RBAC

Roles are lists of claims that are combined to determine resource access permissions for a user wallet. This is a more complex enterprise feature. [Join our Discord](https://discord.gg/UgwAsJf6C5) to request access.

### Questions?

Join our community to stay up to date. [Discord →](https://discord.gg/UgwAsJf6C5)
