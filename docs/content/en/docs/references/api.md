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
 <summary><code>POST</code> <code><b>/auth</b></code> <code>(start a zk-auth flow)</code></summary>

##### Parameters

> | name            | type     | data type | description                  |
> | --------------- | -------- | --------- | ---------------------------- |
> | account_address | required | string    | wallet account address       |
> | encryption_key  | required | string    | wallet public encryption key |

##### Responses

> | http code | content-type       | response                                 |
> | --------- | ------------------ | ---------------------------------------- |
> | `201`     | `application/json` | `{"nonce": "<nonce>"}`                   |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://api.kubelt.com/auth
> ```

</details>

<details>
 <summary><code>POST</code> <code><b>/verify</b></code> <code>(complete zk-auth flow)</code></summary>

##### Parameters

> | name         | type     | data type | description  |
> | ------------ | -------- | --------- | ------------ |
> | signed_nonce | required | string    | signed nonce |

##### Responses

> | http code | content-type       | response                                       |
> | --------- | ------------------ | ---------------------------------------------- |
> | `201`     | `application/json` | `Signed JSON Web Token with user root address` |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}`       |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://api.kubelt.com/verify
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
