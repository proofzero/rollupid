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

#### Creating new/overwriting existing stubs & proxy configs

<details>
 <summary><code>POST</code> <code><b>/</b></code> <code>(overwrites all in-memory stub and/or proxy-config)</code></summary>

##### Parameters

> | name | type     | data type             | description |
> | ---- | -------- | --------------------- | ----------- |
> | None | required | object (JSON or YAML) | N/A         |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `201`     | `text/plain;charset=UTF-8` | `Configuration created successfully`     |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |
> | `405`     | `text/html;charset=utf-8`  | None                                     |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/
> ```

</details>

---

#### Listing existing stubs & proxy configs as YAML string

<details>
 <summary><code>GET</code> <code><b>/</b></code> <code>(gets all in-memory stub & proxy configs)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `text/plain;charset=UTF-8` | YAML string |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:8889/
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
