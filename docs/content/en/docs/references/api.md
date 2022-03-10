---
title: "API"
description: ""
lead: ""
draft: false
images: []
menu:
  docs:
    parent: "references"
weight: 410
toc: true
---

## Auth

---

### Definitions

#### JWT

> ```
> TODO
> ```

### Requests

<details>
 <summary><code>POST</code> <code><b>/@{core}/auth</b></code> <code>(start a zk-auth flow)</code></summary>

The auth request will route and kick off a proof to the core. If no core exists, one will be created and bootstrapped with default configs, EDSCA keys and the signer as the owner.

##### Parameters

> | name   | type     | data type | description                                                  |
> | ------ | -------- | --------- | ------------------------------------------------------------ |
> | core   | required | string    | name of core (e.g. account address, organization, namespace) |
> | signer | required | string    | wallet account address                                       |

##### Responses

> | code  | content-type       | response                                 |
> | ----- | ------------------ | ---------------------------------------- |
> | `201` | `application/json` | `{"nonce": "<nonce>"}`                   |
> | `400` | `application/json` | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://api.kubelt.com/alice/auth
> ```

</details>

<details>
 <summary><code>POST</code> <code><b>/@{core}/verify</b></code> <code>(complete zk-auth flow)</code></summary>

The verify request will reproduce the signer from the auth step to verify the signer and nonce match before issuing a self signed JWT from the core.

##### Parameters

> | name         | type     | data type | description                                |
> | ------------ | -------- | --------- | ------------------------------------------ |
> | core         | required | string    | name of core (e.g. wallet account address) |
> | signed_nonce | required | string    | signed nonce                               |

##### Responses

> | code  | content-type       | response                                       |
> | ----- | ------------------ | ---------------------------------------------- |
> | `201` | `application/json` | `Signed JSON Web Token with user root address` |
> | `400` | `application/json` | `{"code":"400","message":"Bad Request"}`       |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://api.kubelt.com/alice/verify
> ```

</details>

---

## Core

NOTE: Cores will need middleware to do internal authentication/authoriazation.

### Definitions

- TODO: cores object

### Requests

<details>
 <summary><code>GET</code> <code><b>/cores</b></code> <code>(fetch available cores)</code></summary>

This request will ask the authenticated user's core for a list of cores available to the host core. The host is the hostname in the request and verified by the host signature in the JWT.

##### Parameters

> | name | type     | data type | description                             |
> | ---- | -------- | --------- | --------------------------------------- |
> | core | required | string    | the content core (e.g. user account id) |

##### Responses

> | code  | content-type       | response                                        |
> | ----- | ------------------ | ----------------------------------------------- |
> | `200` | `application/json` | `{"cores": [...cores]`                          |
> | `401` | `application/json` | `{"code":"401","message": "Content Not Found"}` |
> | `400` | `application/json` | `{"code":"400","message":"Bad Request"}`        |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://<cname or content.kubelt.com>/crt/bb48bdae67206a493787b69821008fcd6249d013125972db3660e75ab6f3c884
> ```

</details>

<details>
 <summary><code>POST</code> <code><b>/:core</b></code> <code>(create a core)</code></summary>

##### Parameters

> | name | type     | data type | description                             |
> | ---- | -------- | --------- | --------------------------------------- |
> | core | required | string    | the content core (e.g. user account id) |

##### Responses

> | http code | content-type       | response                                          |
> | --------- | ------------------ | ------------------------------------------------- |
> | `200`     | `application/json` | `{"cid": "<IPFS CID>", "metadata": "<metadata>"}` |
> | `401`     | `application/json` | `{"code":"401","message": "Content Not Found"}`   |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}`          |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://<cname or content.kubelt.com>/crt/bb48bdae67206a493787b69821008fcd6249d013125972db3660e75ab6f3c884
> ```

</details>

---

## Content

### Definitions

#### Metadata

> ```
> TODO
> ```

### Requests

<details>
 <summary><code>GET</code> <code><b>/:core/:name</b></code> <code>(fetch CID for name address)</code></summary>

##### Parameters

> | name    | type     | data type | description                             |
> | ------- | -------- | --------- | --------------------------------------- |
> | core    | required | string    | the content core (e.g. user account id) |
> | address | required | string    | the name hash for the managed content   |

##### Responses

> | http code | content-type       | response                                          |
> | --------- | ------------------ | ------------------------------------------------- |
> | `200`     | `application/json` | `{"cid": "<IPFS CID>", "metadata": "<metadata>"}` |
> | `401`     | `application/json` | `{"code":"401","message": "Content Not Found"}`   |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}`          |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://<cname or content.kubelt.com>/crt/bb48bdae67206a493787b69821008fcd6249d013125972db3660e75ab6f3c884
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/:core/dref/:seed</b></code> <code>(detch CID for content using known seed)</code></summary>

##### Parameters

> | name | type     | data type | description                             |
> | ---- | -------- | --------- | --------------------------------------- |
> | core | required | string    | the content core (e.g. user account id) |
> | seed | required | string    | the seed for the kubelt name hash       |

##### Responses

> | http code | content-type       | response                                          |
> | --------- | ------------------ | ------------------------------------------------- |
> | `200`     | `application/json` | `{"cid": "<IPFS CID>", "metadata": "<metadata>"}` |
> | `401`     | `application/json` | `{"code":"401","message": "Content Not Found"}`   |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}`          |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://<cname or content.kubelt.com>/crt/:dref/charizard
> ```

</details>
