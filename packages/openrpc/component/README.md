# @kubelt/openrpc/component

This module defines a "component" model on top of the Cloudflare Durable Object capability. It uses TypeScript decorators to declaratively configure a Durable Object that provides an OpenRPC API, defined by a provided schema, where the object methods map onto RPC methods defined in the schema. The created durable object mediates access to the underlying state (declared using the `@field()` decorator), allowing validation of the data, security permissions checking, and so forth. Many capabilities are planned for the future, but the basic feature set is still evolving.

NB: This library is _alpha_ status, breaking changes remain possible before a 1.0 release. Any feedback on the design, feature requests, and bug reports are very welcome.

## introduction

### @component()

A component is defined using the `@component()` decorator on a class:

```ts
@component(schema)
class MyComponent {}
```

The schema argument must be an OpenRPC schema that conforms to the [open-rpc/meta-schema](https://github.com/open-rpc/meta-schema):

```ts
import type { RpcSchema } from '@kubelt/openrpc'

const rpcSchema: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'My Schema,
    version: '0.1.0',
  },
  methods: [
    ...
  ],
  components: {
    ...
  }
}

export default rpcSchema
```

### @method()

Each RPC method declared in the schema must have a corresponding method defined in the component using the `@method()` decorator. For example, if the schema declared a method named `ex_MyMethod`:
```ts
{
  name: 'ex_MyMethod',
  summary: 'An example method',
  params: [],
  result: {
    name: 'data',
    schema: {
      type: 'object',
    },
  },
}
```

The component would need to declare that method to avoid an error during initialization:
```ts
@component(schema)
export class MyComponent {

  @method(`ex_MyMethod`)
  someMethod(params: RpcParams, input: RpcInput, RpcOutput: alarm: RpcAlarm) {
    ...
  }
}
```

Note that the method name on the class doesn't matter except as far as normal class method naming rules apply (you can't reuse a method name, for example). The mapping between schema declaration and implementation is managed using the name supplied to the `@method()` decorator, not the class method name.

A method takes several parameters:
- params: the RPC method parameters sent in the request to invoke the method
- input: the values of any "fields" declared on the method
- output: the updated values to store in any declared "fields"
- alarm: a utility for scheduling Durable Object alarms

To understand the purpose of the `input` and `output` parameters, we must first understand how data is managed in a component using "fields".

### @field()

A "field" is a data value stored by the component. The data is stored and retrieved using the Durable Object `state.storage.*` calls, but with extra lifecycle hooks included as part of storage and retrieval. A field is declared at the component level using the `@field()` decorator:

```ts
@component(schema)
@field({
  name: 'app',
  doc: 'An application object',
  defaultValue: {},
})
export class MyComponent { ... }
```

Each field that is declared has a `name` used to refer to it, a `doc` string to provide human-readable commentary, and a `defaultValue` that is used to initialize the stored value when the component is initialized.

Extra configuration features planned for fields but not yet ready to go include:
- `scopes`: permissions required to read or write a field
- `validator`: a bespoke validation function applied before storing a new value
- `schemas`: one or more versioned JSON-RPC schemas to apply before storing a new value
- `migrations`: `up()` and `down()` functions for migrating data from one version to another

### @fieldRequired()

Methods must declare that they need to read or write a field using the `@fieldRequired()` decorator. The field _must_ have been declared at the component level. Assuming that the field `app` is declared on the component, the method may indicate that it uses the field:

```ts
@method('ex_MyMethod')
@requiredField('app', [FieldAccess.Read, FieldAccess.Write])
someMethod(params: RpcParams, input: RpcInput, RpcOutput: alarm: RpcAlarm) { ... }
```

The `@requiredField()` decorator accepts an array of field access declarations:
- `FieldAccess.Read` - indicate that the field value is read by a method
- `FieldAccess.Write` - indicate that the field value may be updated by the method

If read access is declared, the field value is injected into the method as an "input". Without configuring read access, the input map will not contain the field value.

If write access is declared, the value of the `app` "output" key is stored as the new field value. Without configuring write access, any value written into the output map for `app` will be ignored and the stored value will remain unchanged.

```ts
@method(`ex_MyMethod`)
@requiredField('app', [FieldAccess.Read, FieldAccess.Write])
someMethod(params: RpcParams, input: RpcInput, RpcOutput: alarm: RpcAlarm) {
  // Get the stored value for the field; this is only available when FieldAccess.Read is declared.
  const app = input.get('app')

  // Updates the stored value for the field; it is only written when FieldAccess.Write is declared.
  output.set('app', { ... })
}
```

### @alarm()

Durable Objects feature support for "alarms", scheduled callbacks that are invoked at a specific time. Using the `@alarm()` method decorator we may mark a component method as being the handler for an alarm:

```ts
@alarm()
someMethod(input: RpcInput, output: RpcOutput, alarm: RpcAlarm) { ... }
```

Because this method is not invoked in response to an RPC request, it is missing the `params` argument that is injected into methods declared using the `@method()` decorator.

If field access is required in the alarm handler, the `@requiredField()` decorator may be used in the same way as for RPC handler methods:

```ts
@alarm()
@requiredField('app', [FieldAccess.Read, FieldAccess.Write])
someMethod(input: RpcInput, output: RpcOutput, alarm: RpcAlarm) { ... }
```

Alarms are scheduled by calling one of:
- `alarm.at()`: schedule an alarm for an absolute time
- `alarm.after()`: schedule an alarm for a relative time

Alarms can be scheduled from RPC handler methods, or from alarm handler methods if you'd like the alarm handler to fire periodically.

To schedule an alarm for a given time:

```ts
const scheduledTime = alarm.at(new Date(Date.UTC(2023, 1, 2, 3, 4, 5)))
```

To schedule an alarm for a relative time:

```ts
const scheduledTime = alarm.after({days: 2, hours: 3, minutes: 22, seconds: 5})
```

### @scopes()

The `@scopes()` decorator is used to declare—at the component level—the set of scopes that are used by the component. Scopes are arbitrary strings right now but may have additional structure imposed in the future as the component security model is refined.

The intent of defining scopes is that a method may require the existence of a granted permission on an incoming request to allow the method to be invoked. More concretely, as we are using JWTs to convey authentication and authorization information, a claim should exist in the JWT sent with an RPC request that corresponds to a scope. Middleware in the component request handler will (eventually) check the permissions included in the supplied token, map them into the component scopes, and if the needed permissions are absent to short-circuit the RPC request without invoking an RPC handler method.

On the component:
```ts
@component(schema)
@scopes(['owner', 'app.update'])
export class MyComponent { ... }
```

On the method:
```ts
@method('ex_someMethod')
@requiredScope('app.update')
someMethod(params: RpcParams, input: RpcInput, RpcOutput: alarm: RpcAlarm) { ... }
```

The set of scopes declared for a component can be discovered at runtime using the `cmp.scopes` method. This is exposed on a component client as `stub._.cmp.scopes()`. This is discussed further in the component client documentation.

## client

TODO

### discover()

TODO

## architecture

This module depends heavily on TypeScript decorators which provide the structure for the implementation of OpenRPC "components". A component is a an "object" that provides an RPC API, a collection of data "fields", and a security model that defines which callers are able to invoke the available methods or access the data fields.

### @component()

The `@component()` decorator defines the underlying Durable Object class. This class is anonymous and hides direct access to the Durable Object API, providing a decorator-based declarative API and lifecycle on top of Durable Objects. It makes the available data fields, scopes, and RPC methods explicit in the component declaration and aims to disallow unmediated access to state. The intended benefit is that, by adhering to the component API, users receive a guarantee that the stored data conforms with the user-supplied rules defining the shape of state:
- JSON Schema
- versioning / migration
- validation functions

The user should also feel confident that data is not readable and/or writable by users without the required permissions.

Every other decorator communicates the data that it manages to the `@component()` decorator for use during the initialization of the component. We use JavaScript reflection to manage this. For example, the `@field()` decorator accepts a description of the shape of some data owned by the component:

```ts
@field({
  name: 'app',
  doc: 'An application object',
  defaultValue: {},
})
```

The implementation of the `@field()` decorator stores this configuration object in a map using the name of the field (converted to a symbol) as the key. If the map does not exist, a new empty Map is created to store `FieldSpec` objects, which are the TypeScript type that describes the structure of field descriptor objects. Note that the entire map is stored on the _constructor_ of the object that the decorator is applied to. The constant `_FIELDS` is just the name of the property that is set on the constructor with the field map as the value.

```ts
export function field(fieldSpec: Readonly<FieldSpec>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Convert the name of the field into a symbol.
    const fieldName = Symbol.for(fieldSpec.name.trim())

    // Get an existing map of fields (if any fields were previously
    // declared), or create a new, empty map otherwise.
    const fields = Reflect.get(constructor, _FIELDS) || new Map<symbol, FieldSpec>()

    // Store the field descriptor object in the field map.
    fields.set(fieldName, fieldSpec)

    // Store the field map on the class constructor function. The
    // constructor is available in the @component context, which is where
    // we pull out this data to use.
    Reflect.set(constructor, _FIELDS, fields)
  }
}
```

When the `@component` decorator is invoked, it pulls the map of field definitions out of the constructor and then deletes the transient property that was used to convey that data:

```ts
export function component(schema: Readonly<RpcSchema>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T): T {
    // Retrieve the collection of field declarations.
    const fields: Fields = Reflect.get(constructor, _FIELDS)
    Reflect.deleteProperty(constructor, _FIELDS)

    // ...do something with the field definitions.
  }
}
```

This pattern also holds for:

- required fields (declared using the `@requiredField()` method decorator:
```ts
const fieldsRequired: RequiredFields = Reflect.get(constructor, _FIELDS_REQUIRED)
Reflect.deleteProperty(constructor, _FIELDS_REQUIRED)
```

- required scopes (declared using the `@requiredScope()` method decorator):
```ts
const scopesRequired: RequiredScopes = Reflect.get(constructor, _SCOPES_REQUIRED)
Reflect.deleteProperty(constructor, _SCOPES_REQUIRED)
```

- the set of scopes (declared using the `@scopes()` class decorator):
```ts
const allScopes: ScopeSet = Reflect.get(constructor, _SCOPES_ALL)
Reflect.deleteProperty(constructor, _SCOPES_ALL)
```

- the mapping from RPC method name to class method name (declared using the `@method()` decorator):
```ts
const rpcMethodMap: MethodMap = Reflect.get(constructor, _METHODS)
Reflect.deleteProperty(constructor, _METHODS)
```

- the name of the alarm method (declared using the `@alarm()` decorator):
```ts
const alarmMethod: string = Reflect.get(constructor, _ALARM_HANDLER)
Reflect.deleteProperty(constructor, _ALARM_HANDLER)
```

Once this data has been retrieved, the Durable Object class is constructed and returned:
```ts
return class extends constructor implements DurableObject { ... }
```

#### class members

The returned Durable Object class has a number of private properties. These include:

- the schema that this OpenRPC service conforms to (supplied via the `@component()` decorator):
```ts
private readonly _schema: RpcSchema
```

- a map from method name (a symbol) to the set of scopes that are required for it to be invoked:
```ts
private readonly _scopes: RequiredScopes
```

- a map from field name (a symbol) to a field descriptor:
```ts
private readonly _fields: Fields
```

- the set of all scopes declared by the component:
```ts
private readonly _allScopes: ScopeSet
```

- access to Cloudflare transactional storage API (injected via the Durable Object constructor):
```ts
private readonly _state: DurableObjectState
```

- the wrangler-configured environment context (injected via the Durable Object constructor):
```ts
private readonly _env: Env
```

- a functional OpenRPC request handler (constructed using the `@kubelt/openrpc` package):
```ts
private readonly _rpcHandler: OpenRpcHandler
```

- a reference to the alarm handler (using the `@alarm()` decorator):
```ts
private readonly _alarmFn: RpcAlarmCallable
```

#### constructor

The constructor stores data in these fields and performs some additional intialization steps:

- the `defaultValue` declared in each `FieldSpec` is stored in Cloudflare durable object storage
  - this `defaultValue` is a property of the argument given to the `@field()` decorator
  - the initial data storage is done in method `_setFieldDefaults()`
- an RPC method handler is created for each declared `@method()`
  - method handlers perform pre- and post-flight checks and setup around RPC method invocation
  - methods are initialized in `_initMethods()`
  - this will be discussed in greater detail below
- an RPC request handler is initialized
  - this uses the functional RPC model provided by `@kubelt/openrpc` (docs to come)
  - the provided OpenRPC schema and the collection of method implementations are used to generate a function that accepts an RPC `Request` and returns a `Response`
  - this handler executes supplied middleware to allow requsts to be inspected and response handling short-circuited
  - the handler is constructed in the `_initRPC` method
  - the handler is stored in the `_rpcHandler` property of the durable object
  - all request processing logic, from middleware to RPC method handling, is exposed via this single function

#### _initMethods()

The `_initMethods()` method defines an RPC handler for each method declared in the schema and returns an array of these handlers. When constructing an RPC method handler the procedure is to:
- retrieve the set of scopes required to invoke the method
- retrieve the set of fields required by the method
- retrieve the class method that implements the RPC method (an `RpcCallable`)
- create a handler function that:
  - extracts `Request` parameters and converts them into a `Map` (using `_prepareParams()`)
  - loads the values stored for the set of required method fields (using `_prepareInput()`)
  - prepares an "output" `Map` for collecting updated field values
  - construct an `RpcAlarm` the user may call to schedule alarms

The RPC method implementation if then invoked:

```ts
const requestResult = await methodFn(
  requestParams,
  fieldInput,
  fieldOutput,
  alarm
)
```

Any outputs that are set by the method are checked to ensure that write permission was requested (by setting `FieldAccess.Write` in the `@requiredField()` decorator on the method) and which are valid (conform to their associated schemas).
```ts
const checkedOutput = this._checkOutput(fieldMap, fieldOutput)
```
NB: schema checking is still a work-in-progress; don't rely on it just yet.

Whatever outputs survive validation are written to durable object storage:
```ts
await this._storeOutput(fieldSet, checkedOutput)
```

If any alarm was set, it's scheduled for eventual execution:
```ts
this._scheduleAlarm(alarm)
```

Finally, the return value of the RPC method handler is set as the RPC method response:
```ts
return openrpc.response(request, requestResult)
```

The handler that does all of the above is "compiled" into an `@kubelt/openrpc` handler and added to the list of service handlers for the component:
```ts
const rpcMethod: RpcMethod = openrpc.method(schema, {
  name: rpcName,
  scopes,
  handler,
})
methods.push(rpcMethod)
```
