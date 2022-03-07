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

### Zero-knowledge authentication flow

<details>
 <summary><code>POST</code> <code><b>/auth</b></code> <code>(start a zk-auth flow)</code></summary>

##### Parameters

> | name       | type     | data type | description                                           |
> | ---------- | -------- | --------- | ----------------------------------------------------- |
> | account_id | required | string    | wallet account id                                     |
> | public_key | required | string    | base64 encoded public key derived from user signature |

##### Responses

> | http code | content-type       | response                                   |
> | --------- | ------------------ | ------------------------------------------ |
> | `201`     | `application/json` | `{"encrypted_nonce": "<encrypted_nonce>"}` |
> | `400`     | `application/json` | `{"code":"400","message":"Bad Request"}`   |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://api.kubelt.com/auth
> ```

</details>

<details>
 <summary><code>POST</code> <code><b>/verify</b></code> <code>(complete zk-auth flow)</code></summary>

##### Parameters

> | name            | type     | data type | description       |
> | --------------- | -------- | --------- | ----------------- |
> | account_id      | required | string    | wallet account id |
> | decrypted_nonce | required | string    | decrypted nonce   |

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

#### Request named content address

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
 <summary><code>GET</code> <code><b>/{stub_numeric_id}</b></code> <code>(gets stub by its resource-id-{stub_numeric_id} in the YAML config)</code></summary>

##### Parameters

> | name              | type     | data type    | description                  |
> | ----------------- | -------- | ------------ | ---------------------------- |
> | `stub_numeric_id` | required | int ($int64) | The specific stub numeric id |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | YAML string                              |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:8889/0
> ```

</details>

<details>
  <summary><code>GET</code> <code><b>/{uuid}</b></code> <code>(gets stub by its defined uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                         |
> | ------ | -------- | --------- | ----------------------------------- |
> | `uuid` | required | string    | The specific stub unique idendifier |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | YAML string                              |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:8889/some-unique-uuid-string
> ```

</details>

<details>
  <summary><code>GET</code> <code><b>/proxy-config/default</b></code> <code>(gets <b>default</b> proxy-config)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | YAML string                              |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:8889/proxy-config/default
> ```

</details>

<details>
  <summary><code>GET</code> <code><b>/proxy-config/{uuid}</b></code> <code>(gets proxy config by its uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                                 |
> | ------ | -------- | --------- | ------------------------------------------- |
> | `uuid` | required | string    | The specific proxy config unique idendifier |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | YAML string                              |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:8889/proxy-config/some-unique-uuid-string
> ```

</details>

---

#### Updating existing stubs & proxy configs

<details>
  <summary><code>PUT</code> <code><b>/{stub_numeric_id}</b></code> <code>(updates stub by its resource-id-{stub_numeric_id} in the config)</code></summary>

##### Parameters

> | name              | type     | data type    | description                  |
> | ----------------- | -------- | ------------ | ---------------------------- |
> | `stub_numeric_id` | required | int ($int64) | The specific stub numeric id |

##### Responses

> | http code | content-type               | response                                                     |
> | --------- | -------------------------- | ------------------------------------------------------------ |
> | `201`     | `text/plain;charset=UTF-8` | `Stub request index#<stub_numeric_id> updated successfully"` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`                     |
> | `405`     | `text/html;charset=utf-8`  | None                                                         |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @put.json http://localhost:8889/0
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/{uuid}</b></code> <code>(updates stub by its defined uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                         |
> | ------ | -------- | --------- | ----------------------------------- |
> | `uuid` | required | string    | The specific stub unique idendifier |

##### Responses

> | http code | content-type               | response                                        |
> | --------- | -------------------------- | ----------------------------------------------- |
> | `201`     | `text/plain;charset=UTF-8` | `Stub request uuid#<uuid> updated successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`        |
> | `405`     | `text/html;charset=utf-8`  | None                                            |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @put.json http://localhost:8889/some-unique-uuid-string
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/proxy-config/default</b></code> <code>(updates <b>default</b> proxy-config)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response                                         |
> | --------- | -------------------------- | ------------------------------------------------ |
> | `201`     | `text/plain;charset=UTF-8` | `Proxy config uuid#default updated successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`         |
> | `405`     | `text/html;charset=utf-8`  | None                                             |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @put.json http://localhost:8889/proxy-config/default
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/proxy-config/{uuid}</b></code> <code>(updates proxy-config by its uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                                 |
> | ------ | -------- | --------- | ------------------------------------------- |
> | `uuid` | required | string    | The specific proxy config unique idendifier |

##### Responses

> | http code | content-type               | response                                        |
> | --------- | -------------------------- | ----------------------------------------------- |
> | `201`     | `text/plain;charset=UTF-8` | `Proxy config uuid#<uuid> updated successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`        |
> | `405`     | `text/html;charset=utf-8`  | None                                            |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @put.json http://localhost:8889/proxy-config/some-unique-uuid-string
> ```

</details>

---

#### Deleting existing stubs & proxy configs

<details>
  <summary><code>DELETE</code> <code><b>/</b></code> <code>(deletes all in-memory stub & proxy configs)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response                                             |
> | --------- | -------------------------- | ---------------------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | `All in-memory YAML config was deleted successfully` |

##### Example cURL

> ```javascript
>  curl -X DELETE -H "Content-Type: application/json" http://localhost:8889/
> ```

</details>

<details>
  <summary><code>DELETE</code> <code><b>/{stub_numeric_id}</b></code> <code>(deletes stub by its resource-id-{stub_numeric_id} in the config)</code></summary>

##### Parameters

> | name              | type     | data type    | description                  |
> | ----------------- | -------- | ------------ | ---------------------------- |
> | `stub_numeric_id` | required | int ($int64) | The specific stub numeric id |

##### Responses

> | http code | content-type               | response                                                    |
> | --------- | -------------------------- | ----------------------------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | `Stub request index#<stub_numeric_id> deleted successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`                    |

##### Example cURL

> ```javascript
>  curl -X DELETE -H "Content-Type: application/json" http://localhost:8889/0
> ```

</details>

<details>
  <summary><code>DELETE</code> <code><b>/{uuid}</b></code> <code>(updates stub by its defined uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                         |
> | ------ | -------- | --------- | ----------------------------------- |
> | `uuid` | required | string    | The specific stub unique idendifier |

##### Responses

> | http code | content-type               | response                                        |
> | --------- | -------------------------- | ----------------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | `Stub request uuid#<uuid> deleted successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`        |

##### Example cURL

> ```javascript
>  curl -X DELETE -H "Content-Type: application/json" http://localhost:8889/some-unique-uuid-string
> ```

</details>

<details>
  <summary><code>DELETE</code> <code><b>/proxy-config/{uuid}</b></code> <code>(deletes proxy-config by its uuid property)</code></summary>

##### Parameters

> | name   | type     | data type | description                                 |
> | ------ | -------- | --------- | ------------------------------------------- |
> | `uuid` | required | string    | The specific proxy config unique idendifier |

##### Responses

> | http code | content-type               | response                                        |
> | --------- | -------------------------- | ----------------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8` | `Proxy config uuid#<uuid> deleted successfully` |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}`        |

##### Example cURL

> ```javascript
>  curl -X DELETE -H "Content-Type: application/json" http://localhost:8889/proxy-config/some-unique-uuid-string
> ```

</details>

---
