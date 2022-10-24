/**
 * @package @kubelt/openrpc
 * @file src/component/index.ts
 */

import { difference as setDifference } from "ts-set-utils";

import type {
  OpenRpcHandler,
  RpcHandler,
  RpcRequest,
  RpcResponse,
  RpcSchema,
} from "../index";

import * as openrpc from "../index";

// Definitions
// -----------------------------------------------------------------------------

const _METHODS = "_rpcMethods";

// Internal field name for set of all scopes declared by the object.
const _SCOPES_ALL = "_allScopes";

// Internal field name for map of method to set of required scopes.
const _SCOPES_REQUIRED = "_requiredScopes";

// Types
// -----------------------------------------------------------------------------

// A permission representing the ability to invoke an RPC method.
type Scope = Symbol;

// A collection of scopes.
type ScopeSet = Set<Scope>;

// The mapping from method name to its required scopes.
type RequiredScopes = Map<Symbol, ScopeSet>;

// Defines the signature for an OpenRPC handler method defined on a Durable
// Object and which is marked as an @rpcMethod.
type RpcMethod = (
  request: RpcRequest,
  state: Map<string, any>,
  context: Map<string, any>,
  remote: Map<string, any>,
) => RpcResponse;

type Env = unknown;

// rpcObject
// -----------------------------------------------------------------------------

/**
 * This class decorator is called as a function at runtime with the constructor of
 * the decorated class as its only argument.
 *
 * By returning a value, this class decorator replaces the class declaration with
 * the provided constructor function. NB: by returning a new constructor function
 * we must take care to maintain the original prototype. The logic that applies
 * decorators at runtime does *not* do this for you.
 */
export function rpcObject(schema: RpcSchema) {

  // Check that the set of scopes required on methods is a subset of all scopes
  // declared on the object. Any required scopes that aren't declared by the class
  // are returned; if this set is non-empty that indicates an error by the developer.
  function checkScopes(declaredScopes: ScopeSet, reqScopes: RequiredScopes): ScopeSet {
    // *sigh* there's no Set.union() method so do it ourselves.
    const unionScopes: ScopeSet = new Set();
    for (const method of reqScopes.keys()) {
      const methodScopes: ScopeSet | undefined = reqScopes.get(method);
      if (undefined === methodScopes) {
        throw new Error(`missing scope set for method '${method.description}'`);
      }
      for (const scope of methodScopes.values()) {
        unionScopes.add(scope);
      }
    }

    const extraScopes = setDifference(unionScopes, declaredScopes);

    // FIXME ensure multiple scopes are collected correctly

    // TEMP
    console.log("declared scopes:");
    for (const scope of declaredScopes) {
      console.log(scope);
    }
    console.log("union scopes:");
    for (const scope of unionScopes) {
      console.log(scope);
    }
    console.log("extra scopes:");
    for (const scope of extraScopes) {
      console.log(scope);
    }

    // TODO Compute the difference between all declared scopes and the set of scopes the
    // user has indic,ated are required.
    return extraScopes;
  }

  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    /*
    console.log(`@rpcObject`);
    console.log(`@rpcObject.name: ${constructor.name}`);
    console.log(`@rpcObject.prototype: ${JSON.stringify(constructor.prototype, null, 2)}`);
    constructor.prototype._scopes.forEach((v: Symbol) => {
      console.log(`@rpcObject._scope: ${v.toString()}`);
    });
    console.log(`Reflect.ownKeys(rpcObject): ${Reflect.ownKeys(constructor)}`);
    */

    const methods = Reflect.get(constructor, _METHODS);
    console.log(`@rpcObject.methods: ${methods}`);

    // Check that union of required scopes from all methods are
    // contained in the set of scopes defined by @rpcScopes. If the user
    // requires a scope on a method that isn't declared on the class using
    // @rpcScopes, throw an error.
    const allScopes = Reflect.get(constructor, _SCOPES_ALL);
    const reqScopes = Reflect.get(constructor, _SCOPES_REQUIRED);
    // END TEMP
    const undeclaredScopes = checkScopes(allScopes, reqScopes);
    if (undeclaredScopes.size > 0) {
      const errorScopes = [];
      for (const scope in undeclaredScopes.values()) {
        errorScopes.push(scope.toString());
      }
      throw Error(`undeclared scopes: ${errorScopes.join(", ")}`);
    }

    // TODO seal the generated object so that all fields, etc. must be defined declaratively
    // using decorators. Stay out of trouble, friends!

    /**
     * @param {state} a transactional storage API
     * @param {env} any configured bindings
     */
    return class extends constructor implements DurableObject {

      // The schema that this OpenRPC service conforms to.
      private readonly _schema: RpcSchema;

      // A map from method to the set of scopes that it requires to be invoke.
      private readonly _scopes: RequiredScopes;

      // Access to Cloudflare transactional storage API.
      private readonly _state: DurableObjectState;

      // The wrangler-configured environment context.
      private readonly _env: Env;

      // The collection of RPC method implementations defined in a subclass.
      private readonly _methods: Array<RpcHandler> = [];

      // A functional OpenRPC request handler. It should be invoked as:
      //   rpcHandler(request: Request, context?: RpcContext);
      // It returns a Response containing a JSON-RPC format response body.
      private readonly _rpcHandler: OpenRpcHandler;

      constructor(...args: any[]) {
        //console.log(`@rpcObject.constructor`);
        //console.log(args);
        super();

        // TODO Define all these properties to be non-enumerable. There's a proposal
        // for nonenum keyword here: https://github.com/microsoft/TypeScript/issues/9726
        // but that's likely not happening soon, so prefer Object.defineProperty() for now.
        this._schema = schema;
        this._scopes = reqScopes;
        this._state = <DurableObjectState>args[0];
        this._env = <Env>args[1];

        // Construct RPC handler that conforms to the schema, using the
        // supplied methods to implement the defined service methods.
        this._rpcHandler = this.initRPC(schema, methods);

        // Variables in a Durable Object will maintain state as long as your
        // DO is not evicted from memory. A common pattern is to initialize
        // an object from persistent storage and set instance variables the
        // first time it is accessed. Since future accesses are routed to
        // the same object, it is then possible to return any initialized
        // values without making further calls to persistent storage.
        /*
        this.state.blockConcurrencyWhile(async () => {
          const stored = await this.state.storage.get("value");
          // After init, future reads do not need to access storage.
          // Use this.value rather than storage in fetch() afterwards.
          this.value = stored || 0;
        });
        */
      }

      /**
       *
       */
      initRPC(rpcSchema: RpcSchema, rpcMethods: Array<RpcHandler>): OpenRpcHandler {
        // Construct a sequence of middleware to execute.
        const chain = openrpc.chain([
          // Authenticate using a JWT in the request.
          //mwAuthenticate,
          // Extra geolocation data provided by Cloudflare.
          //mwGeolocation,
          // Cloudflare Worker analytics.
          //mwAnalytics,
          // Construct a Datadog client for sending metrics.
          //mwDatadog,
          // Construct an Oort client for talking to the Kubelt backend.
          //mwOort,
          // An example middleware defined locally.
          //middle.example,
        ]);

        // Supply implementations for all of the API methods in the schema.
        const methods = openrpc.methods(rpcSchema, rpcMethods);

        // Configuration options for the API.
        const options = openrpc.options({
          // Enable OpenRPC service discovery.
          rpcDiscover: true,
        });

        const basePath = "/";

        const rootPath = "/openrpc";

        // The returned handler validates the incoming request, routes it to the
        // correct method handler, and executes the handler on the request to
        // generate the response.
        return openrpc.handler(
          basePath,
          rootPath,
          schema,
          methods,
          chain,
          options
        );
      }

      // Workers communicate with a Durable Object via the Fetch API. Like a
      // Worker, a Durable Object listens for incoming Fetch events by
      // registering this event handler.
      //
      // NB: A Worker can pass information to a Durable Object via headers,
      // the HTTP method, the Request body, or the Request URI.
      async fetch(request: Request) {
        // const ip: string = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
        // const data: string = await request.text();
        // const storagePromise = this.state.storage.put(ip, data);
        // await storagePromise;

        // TODO define context based on configured decorators? e.g.
        // - @rpcSecret: adds a secret to the context
        // - @rpcBucket: adds an R2 bucket to the context
        // - @rpcKV: adds a KV store to the context
        // etc.
        const context = openrpc.context();

        return await this._rpcHandler(request, context);
      }

    }
  }
}

// rpcScopes
// -----------------------------------------------------------------------------

/**
 * Defines the collection of scopes exposed by the object. For example, a
 * state management object might expose scopes that allow any data to be
 * read or written. A service object providing computational services
 * might require "execute" scope, etc.
 *
 * Individual methods and fields may protect their invocation or access
 * with any of these scopes by using an appropriate decorator.
 */
export function rpcScopes(scopes: Array<string>) {
  //console.log("factory: @rpcScopes");
  //console.log(`provided scopes: ${scopes}`);

  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    //console.log("@rpcScopes");

    // Turn each scope string into a Symbol.
    const scopeSet: ScopeSet = new Set(
      scopes.map(scope => {
        return Symbol.for(scope.trim().toLowerCase());
      })
    );

    // Define this property so as to be read-only and non-enumerable, i.e. it
    // won't show up if the user should iterate over the keys of the target.
    // NB: we define the property on the constructor and not the prototype
    // because we are simply passing these values to the @rpcObject context for
    // use in initializing the durable object instance.
    Object.defineProperty(constructor, _SCOPES_ALL, {
      value: scopeSet,
      enumerable: false,
      writable: false,
    });
  }
}

// rpcMethod
// -----------------------------------------------------------------------------

/**
 * Marks a method as being the implementation of a particular OpenRPC schema method.
 *
 * @param schemaMethod the name of the schema method the decorated class
 * method implements.
 */
export function rpcMethod(schemaMethod: string) {
  // - target: class constructor function for static member OR the
  //   prototype of the class for an instance member
  // - propertyKey: the name of the member
  // - descriptor: a Property Descriptor for the method
  //
  // NB: If a method decorator returns a value it is used as the property
  // descriptor for the method.

  return function (
    // TODO better type here
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    /*
    console.log(`factory: @rpcMethod`);
    console.log(`> target: ${JSON.stringify(target, null, 2)}`);
    console.log(`> typeof(target): ${typeof(target)}`);
    console.log(`> instanceof(target, StarbaseApp): ${target instanceof StarbaseApp}`);
    console.log(`> Reflect.ownKeys(target): ${Reflect.ownKeys(target)}`);
    console.log(`> propertyKey: ${methodName}`);
    console.log(`> descriptor: ${JSON.stringify(descriptor, null, 2)}`);
    */

    // [class StarbaseApp]
    //console.log(target.constructor);

    // We use a symbol to look up metadata stored about the method.
    const methodSym = Symbol.for(methodName);

    // TODO add the method this decorator is attached to (RpcMethod) to the
    // list of class methods stored in the class methods.
    const method = openrpc.method(schemaMethod, async (request, context) => {
      // The scopes required to be able to invoke the RPC method. The returned value
      // is a Set of Symbol values representing the required scope names.
      const requiredScopes = Reflect.get(target.constructor, _SCOPES_REQUIRED).get(methodSym) || [];
      // The RPC method implementation.
      const method = Reflect.get(target, methodName);

      // TODO check scopes on incoming request, make sure that the required scopes
      // have been granted to the caller. Use a middleware?

      // TODO invoke the decorated method with:
      // - check for required scopes
      // - inject readable state (object with readable property)
      // - inject writable state (object with writable property)
      const result = method(request);

      return openrpc.response(request, result);
    });

    // Add this handler to the set of RPC method implementations.
    // This list of methods is used in @rpcObject to construct an RPC request
    // handler that replies to fetch() calls to the durable object.
    const methods = Reflect.get(target.constructor, _METHODS);
    const updated: Array<RpcHandler> = (undefined === methods) ?
      [method] :
      methods.concat(method)
    ;
    Reflect.set(target.constructor, _METHODS, updated);
  };
}

// rpcField
// -----------------------------------------------------------------------------

/**
 * Defines a data field that this object manages. These fields may be
 * read or written to if a method has permission (provided by applying
 * the @readState and @writeState decorators.
 */
type ValidatorFn = (x: any) => boolean;

type FieldSpec = {
  // The name of the field.
  name: string;
  // The default value of the field.
  default: any;
  // The validation function to apply before updating the field.
  validator: ValidatorFn;
};
function rpcField(m: FieldSpec) {
  console.log("factory: field");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("field");
  }
}

// requiredScope
// -----------------------------------------------------------------------------

/**
 * Sets a scope that the user must have in order to invoke the RPC method.
 */
export function requiredScope(scope: string | Symbol) {
  //console.log("factory: @requiredScope");

  // NB: We may want to support passing in an array of scopes.
  const scopeSym: Symbol = (typeof(scope) === "string") ?
    Symbol.for(scope.trim().toLowerCase()) :
    scope
  ;

  // This creates or updates a class member that contains the
  // required scopes for every method that is decorated. The constant
  // _SCOPES_REQUIRED provides the name of that value. We read the current
  // set of defined scopes for the method (or create an empty set if none
  // have yet been defined) and then add the required scope to the set before
  // storing the result.

  // TODO define _SCOPES_REQUIRED property with Object.defineProperty()
  // and make it non-enumerable (since it's an internal implementation detail).
  function getRequiredScopes(target: any): RequiredScopes {
    // TODO use a better type for target.
    return Reflect.get(target, _SCOPES_REQUIRED) || new Map();
  }

  return function (
    // TODO better type here
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const propertySym = Symbol.for(propertyKey);

    const requiredScopes: RequiredScopes = getRequiredScopes(target);

    const currentScopes: ScopeSet = requiredScopes.get(propertySym) || new Set();
    const updatedScopes: ScopeSet = currentScopes.add(scopeSym);

    requiredScopes.set(propertySym, updatedScopes);

    Reflect.set(target.constructor, _SCOPES_REQUIRED, requiredScopes);
  }
}

// requiredEnvironment
// -----------------------------------------------------------------------------

/**
 * Injects an environment variable.
 */
function requiredEnvironment(name: string) {
  console.log("factory: requiredEnvironment");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("requiredEnvironment");
  }
}

// requiredSecret
// -----------------------------------------------------------------------------

/**
 * Injects a secret value.
 */
function requiredSecret(name: string) {
  console.log("factory: requiredSecret");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("requiredSecret");
  }
}

// requiredRemote
// -----------------------------------------------------------------------------
// TODO Add another superclass that implements generic graph
// interface. Extend RPC schema with standard collection of graph-related
// methods that are included in the rpc.discover output.
// - node.link - create an edge to another object

// TODO inject an RPC client for each remote object type that user indicates they require.
// Or perhaps this should be more tightly linked to graph metaphor?
function requiredRemote() {
  console.log("factory: requiredRemote");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("requiredRemote");
  }
}

// readState
// -----------------------------------------------------------------------------

/**
 * Lists the state fields that a method is allowed to read. Injects
 * those values into a method.
 */
function readState(names: Array<string>) {
  console.log("factory: requiredState");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("requiredState");
  }
}

// writeState
// -----------------------------------------------------------------------------

/**
 * Lists the state fields that a method is allowed to update.
 */
function writeState(names: Array<string>) {
  console.log("factory: requiredState");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("requiredState");
  }
}
