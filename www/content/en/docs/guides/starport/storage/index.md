---
title: "Storage Service"
description: ""
lead: ""
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "starport"
weight: 900
toc: true
---

### Storage Service

The Storage Service allows you to store arbitrary text data in a user core.

Keys with dotted sub-paths are supported. This means you can store an entire object using a given key and retrieve elements of it:

```javascript
const sdk = getSDK() // Defined elsewhere. Returns a configured SDK instance.

const namespace = 'foo'
const path = 'my'
const value = {
  example: "hello"
}

await sdk.request('kb_setData', [namespace, path, value])
const result = await sdk.request('kb_getData', [namespace, 'my.example'])

// result.value === value.example
```

### kb_getData

`kb_getData` is the method for getting data from storage keys.

#### Parameters

`kb_getData` takes two parameters:

* `namespace`, the first parameter, is the namespace within which the unique path exists. For example: `"3id"`.
* `path`, the second parameter, is the dotted path of the data to be retrieved. For example: `"profile"`, `"profile.email"`, etc.

#### Unauthenticated

##### Request

Storage Service methods are authenticated. Making a call with an unauthenticated SDK insance will error:

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_getData",
  "params": ["3id", "profile.nickname"]
}
```

##### Response

```json
{
	"jsonrpc": "2.0",
	"id": "f9f1fe0a-1e45-43e6-9d48-e3c94bf07d22",
	"error": {
		"code": -32603,
		"message": "cannot authorize"
	}
}
```

#### Authenticated

##### Request

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_getData",
  "params": ["3id", "profile"]
}
```

##### Response

```json
{
	"jsonrpc": "2.0",
	"id": "184ebb00-fad7-4f54-a1fd-6291e624d0f8",
	"result": {
		"namespace": "3id",
		"path": "profile",
		"value": {
			"nickname": "alfl.eth"
		}
	}
}
```

### kb_setData

`kb_setData` is the method for setting data for a given key.

#### Parameters

`kb_setData` takes three parameters:

* `namespace`, the first parameter, is the namespace within which the unique path exists. For example: `"3id"`.
* `path`, the second parameter, is the dotted path of the data to be retrieved. For example: `"profile"`, `"profile.email"`, etc.
* `value`, the third parameter, is the value to be set for the `path` key.

#### Unauthenticated

##### Request

Storage Service methods are authenticated. Making a call with an unauthenticated SDK insance will error:

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_setData",
  "params": ["3id", "profile.nickname", "alfl.eth"]
}
```

##### Response

```json
{
	"jsonrpc": "2.0",
	"id": "bc694827-bc34-4bcd-bf99-42e5b6378e4a",
	"error": {
		"code": -32603,
		"message": "cannot authorize"
	}
}
```

#### Authenticated

##### Request

```
POST :host/@:core/jsonrpc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "kb_setData",
  "params": ["3id", "profile.nickname", "alfl.eth"]
}
```

##### Response

```json
{
	"jsonrpc": "2.0",
	"id": "1798b424-37d2-42e7-b479-33f437696fef",
	"result": {
		"namespace": "3id",
		"path": "profile.nickname",
		"value": "alfl.eth"
	}
}
```

### FAQ

Joining our [Discord →](https://discord.gg/UgwAsJf6C5) is the fastest way to get your question answered.
