// @kubelt/openrpc:impl/client.ts

/**
 * An OpenRPC client implementation used to construct an RPC client for
 * an RPC service, particularly that implemented by a "component" (a
 * Cloudflare durable object providing a standard OpenRPC interface) as
 * defined in this package, with plans to extend the client to be more
 * generally useful.
 *
 * The returned client has methods that proxy requests to the remote
 * service. It also exposes two properties that contain nested
 * namespaces:
 * - <stub>.$ contains properties pertaining to the remote service, the
 *   prime example of which is <stub>.$.id, the remote Durable Object ID
 * - <stub>._ contains nested namespaces of "extension" functions, for
 *   example a standard API for working with "components",
 *   e.g. obtaining the list of scopes used by the component.
 */

import * as _ from 'lodash'

import { toCamelCase } from 'js-convert-case'

import type { MethodObject, MethodOrReference } from '@open-rpc/meta-schema'

import type { ParsedURN } from 'urns'

import type { RpcResponse, RpcSchema } from './index'

import type { RequestParams } from './jsonrpc'

import type { RpcResult } from '../component/index'

import {
  AnyURN,
  createAnyURNSpace,
  createObjectURNSpace,
  ObjectURN,
} from '@kubelt/urns'

// Types
// -----------------------------------------------------------------------------

// A namespace into which RPC methods are added and which is exposed by
// the ._ accessor.
//type RpcNamespace = Record<string, Function>

type RpcClientFn = (params: RequestParams) => unknown

//type RpcDispatch = Record<string, RpcNamespace | Function>
interface RpcDispatch {
  // TODO when 'any' replaced by RpcClientFn we get a type inference
  // error, the fn name is 'not defined' on the parent namespace object.
  [name: string]: RpcDispatch | any //RpcClientFn
}

// A map of data properties we expose with the .$ accessor.
type RpcProperties = {
  // A string serialized DurableObjectId.
  // TODO use a tighter type for stringified DurableObjectId.
  id: string
  // An arbitrary string name for the durable object (if provided)
  name?: string
  // The URN representation of a Durable Object ID.
  urn?: string
  // These are the components of the parsed URN.
  nid?: string
  nss?: string
  rc?: string
  qc?: string
  fc?: string
}

// RpcRequestOptions
// -----------------------------------------------------------------------------

type RequestOptions = ClientOptions
// A derived partial type allows any properties to be omitted.
export type RpcRequestOptions = Readonly<Partial<RequestOptions>>

// RpcExpandedSchema
// -----------------------------------------------------------------------------
// In an expanded schema any methods that contain a reference are
// dereferenced so that the full definition is inline.

export interface RpcExpandedSchema extends Omit<RpcSchema, 'methods'> {
  methods: MethodObject[]
}

// RpcClientOptions
// -----------------------------------------------------------------------------

// A JWT token.
export type AuthToken = string

// NB: if none of id, name, or urn are supplied, a random durable object
// ID (and consequently a new durable object instance) is created.
interface ClientOptions {
  // An object ID that is converted into an object ID using
  // OBJECT_NAMESPACE.isFromString(). If you have a DurableObjectId and
  // convert it to a string using toString(), supplying that ID string
  // as the ID parameter will generate original DurableObjectId.
  //
  // Exclusions: name, urn.
  id: string
  // An object name that is converted/hashed into an object ID using
  // OBJECT_NAMESPACE.idFromName().
  //
  // Exclusions: id, urn.
  name: string
  // A token that, if provided, is sent with all requests sent by the
  // client.
  token: AuthToken
  // A string description of the component; used as host component of
  // URL when logging.
  tag: string
  // A URN used to uniquely identify a node. The URN is converted into a
  // DurableObjectId using OBJECT_NAMESPACE.idFromName().
  //
  // Exclusions: id, name.
  urn: AnyURN | ParsedURN<string, string>
}

export type RpcClientOptions = Readonly<Partial<ClientOptions>>

// RpcClient
// -----------------------------------------------------------------------------

export class RpcClient {
  // The DO that is a client for.
  private readonly _durableObject: DurableObjectNamespace
  // The name of the durable object.
  private readonly _id: DurableObjectId
  // A URN representation of the internal durable object ID.
  private readonly _urn?: AnyURN | ParsedURN
  // The name of the object, if provided. Converted into an internal ID.
  // TODO type should be our platform URN.
  private readonly _name?: string
  // The OpenRPC schema with method references resolved.
  private readonly _schema: RpcExpandedSchema
  // The options configuration map.
  private readonly _options: RpcClientOptions
  // A string description of the component; used as host component of
  // URL when logging.
  private readonly _tag: string
  // A nested object whose properties are functions that can be called
  // to invoke "internal" methods exposed by a component. These methods
  // are exposed via the ._ accessor.
  private readonly _internal: RpcDispatch
  // A map of data properties we expose with the .$ accessor.
  private readonly _properties: RpcProperties
  // RPC calling stub; use its .fetch() method to reach DO.
  // TODO needs a type
  private readonly _stub
  // Keep track of the JSON-RPC request ID so we can assign incrementing
  // values to subsequent requests.
  private _requestId: number;

  // Allow for the methods added to the client to correspond to the
  // methods described in the schema that was used to initialize it.
  [index: string]: RpcResult

  // TODO dynamically extend the RpcClient base class to something that
  // has a type derived from the schema.

  // TODO consider supporting a standard component method to set an
  // "exposed" field, then allowing that remote field to be set with a
  // local property write:
  // @field("foo", [...], {exposed: true})
  // Then this would make an RPC call to e.g. cmp.setField to store a field value.
  // someObj.foo = "bar"

  constructor(
    durableObject: DurableObjectNamespace,
    id: DurableObjectId,
    schema: RpcSchema,
    options: RpcClientOptions = {}
  ) {
    const expandedSchema: RpcExpandedSchema = this._expand(schema)

    this._durableObject = durableObject
    this._id = id
    this._urn = options?.urn || createObjectURNSpace().urn(id.toString())
    this._name = options?.name || undefined
    this._schema = expandedSchema
    this._options = options
    // TODO better to try and derive a tag name from durableObject, if possible.
    this._tag = options?.tag || 'do.unknown'

    this._stub = durableObject.get(id)

    // This is sent as the JSON-RPC request ID, and incremented with
    // each request.
    this._requestId = 0

    // Filter schema methods into internal / external lists.
    // TODO pass in regex from options that is used to split on method name.
    const [internal, external]: [MethodObject[], MethodObject[]] =
      this._splitMethods(expandedSchema.methods)
    //console.log(internal);
    //console.log(external);

    // Obtain a nested hierarchy of "internal" methods. These are
    // exposed on the client stub under the "_" namespace.
    this._internal = this._internalMethods({}, internal)
    // Add a method to the client stub for each "external" RPC method.
    this._externalMethods(this, external)
    // Define a collection of properties to expose with the $ accessor.
    this._properties = this._initProperties(this._id, this._urn, this._name)

    // Freeze the collection of properties that we expose as <stub.$>.
    Object.freeze(this._properties)
    // Freeze the hierarchical collection of methods that we expose as
    // <stub._>.
    Object.freeze(this._internal)
  }

  /**
   * Takes an OpenRPC schema and returns that same schema with internal
   * references expanded inline.
   *
   * TODO proper schema expansion
   */
  private _expand(schema: RpcSchema): RpcExpandedSchema {
    // TODO for now, we drop any references in the methods (a method
    // with $ref property); later we need to properly expand those
    // references to include them inline!
    _.remove(schema.methods, (method: MethodOrReference): boolean => {
      if (method['$ref']) {
        return true
      }
      return false
    })

    return schema as RpcExpandedSchema
  }

  /**
   * Splits array into two sub-arrays; the first sub-array is composed
   * of elements that returned true for the supplied predicate, and the
   * second group of elements that returned false.
   */
  private _splitMethods(
    methods: MethodObject[]
  ): [MethodObject[], MethodObject[]] {
    return _.partition(methods, (method) => {
      // TODO make this regex a client option
      return /\./.test(method.name)
    })
  }

  /**
   * Obtain a nested hierarchy of "internal" methods. These are exposed
   * on the client stub under the "_" namespace.
   */
  private _internalMethods(
    target: RpcDispatch,
    methods: MethodObject[]
  ): RpcDispatch {
    return _.reduce(
      methods,
      (ns, method) => {
        // Figure out at what path in the target the function will be
        // created.
        const path = _.split(method.name, '.')

        // TODO make fn arguments correspond to expected RPC arguments?
        // - alternately, accept array of args
        // - alternately, accept map of args
        // - alternately, accept obj of args

        return this._rpcMethod(ns, path, method.name, method)
      },
      target
    )
  }

  /**
   * Add a method to the client stub for each "external" RPC method.
   */
  private _externalMethods(target: RpcDispatch, methods: MethodObject[]) {
    // Define a function on the target object for each RPC method
    // descriptor in methods.
    _.each(methods, (method: MethodObject): void => {
      this._rpcMethod(
        target,
        // Set external methods directly on the client stub object by
        // using an "empty" path.
        [],
        // The name we should expose the method as on the client object.
        toCamelCase(method.name),
        // Replace the method name by its camel-cased version.
        method
      )
    })
  }

  /**
   * Define the collection of properties we expose to describe the client.
   */
  private _initProperties(
    doId: Readonly<DurableObjectId>,
    urn?: Readonly<AnyURN | ParsedURN>,
    // TODO proper type for platform URN?
    name?: string
  ): RpcProperties {
    const idStr = doId.toString()
    const urnStr = urn?.toString()

    let parts = {}
    if (typeof urn === 'object') {
      // The various components of the URN (if present).
      parts = {
        nid: urn?.nid,
        nss: urn?.nss,
        rc: urn?.rcomponent,
        qc: urn?.qcomponent,
        fc: urn?.fragment,
      }
    }

    return _.merge(
      {
        // The ID of the durable object as a string.
        id: idStr,
        // The platform namespace ('threeid') URN of the object, if provided.
        name,
        // A URN representation of the internal durable object ID.
        urn: urnStr,
      },
      parts
    )
  }

  // Access the "internal" method table.
  get _(): RpcDispatch {
    // This nested namespace object is sealed.
    return this._internal
  }

  /**
   * Access properties on the stub without colliding with exposed RPC
   * methods.
   */
  get $(): RpcProperties {
    return this._properties
  }

  /**
   *
   */
  private _rpcMethod(
    target: RpcDispatch,
    path: string[],
    name: string,
    method: Readonly<MethodObject>
  ): RpcDispatch {
    // Create a fn for the RPC call.
    // TODO tighten up params type
    // TODO return Promise<RpcResult>?
    const fn: RpcClientFn = this._makeRpcFn(method, this._options)

    if (path.length <= 0) {
      return Object.defineProperty(target, name, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: fn,
      })
    } else {
      // Store at correct namespace hierarchy object.
      //
      // TODO would be nice if we could use Object.defineProperty() as
      // above. Looked at _.setWith() already, that only allows
      // customization of how intervening path levels are created, not
      // how the final assignment is performed.
      return _.set(target, path, fn)
    }
  }

  /**
   *
   */
  private _makeRpcFn(
    method: MethodObject,
    clientOpt: RpcClientOptions
  ): RpcClientFn {
    const execute = _.bind(this._execute, this)

    // TODO tighten up the types on params, etc.
    return async function (
      params: RequestParams,
      requestOpt: RpcRequestOptions = {}
    ) {
      // Merge any per-request options on top of the options supplied
      // when constructing the client.
      const options: RpcClientOptions = _.merge({}, clientOpt, requestOpt)

      // TODO convert any params to object, e.g. if supplied as array
      // TODO validate the params using schema
      // TODO validate the result against the schema
      // TODO perform any necessary transformation on the result
      return execute(method.name, params, options)
    }
  }

  /**
   *
   */
  private async _execute(
    method: string,
    params: RequestParams,
    options: RpcRequestOptions
  ): Promise<RpcResult> {
    // This base URL is ignored for routing purposes since the calls are
    // dispatched using an object stub. Instead we encode the name of the
    // durable object into the URL for informational purposes, e.g. when
    // logging.
    //
    // TODO extract durable object name and use for this URL, if possible.
    const baseURL = `https://${this._tag}`
    // If we use ${objId} in the URL it is REDACTED in the logs.
    const url = new URL(`/openrpc`, baseURL)

    // Increment the JSON-RPC request ID.
    this._requestId++

    // TODO use generic JSON-RPC client;
    // - impl.jsonrpc.request() to build request
    // - impl.jsonrpc.execute(req) to execute request
    const rpcRequest = {
      jsonrpc: '2.0',
      id: this._requestId,
      method,
      params,
    }
    const body = JSON.stringify(rpcRequest)

    const headers = {
      'Content-Type': 'application/json',
    }
    if (options.token !== undefined) {
      // NB: _.set() mutates the target object as well as returning it.
      _.set(headers, 'Authorization', options.token)
    }

    // Note that workers can pass state to durable objects via headers,
    // the HTTP method, the Request body, or the Request URI. Does it
    // make sense to supply that information as part of the RpcRequest
    // as extra context?
    const request = new Request(url.toString(), {
      method: 'POST',
      headers,
      body,
    })

    // TODO check response status
    const response = await this._stub.fetch(request)
    if (!response.ok) {
      // TODO
    }

    // TODO handle parse errors
    // TODO validate against OpenRPC meta-schema
    // TODO perform a type assertion
    const rpcJSON: RpcResponse = await response.json()

    // Check that JSON-RPC response has an ID that matches the one sent
    // in the request.
    if (Object.hasOwn(rpcJSON, 'id')) {
      if (rpcJSON.id !== this._requestId) {
        console.warn(
          `mismatch in request and response ID: ${this._requestId} <> ${rpcJSON.id}`
        )
      }
    }

    // TODO check for .result or .error
    if (Object.hasOwn(rpcJSON, 'result')) {
      return _.get(rpcJSON, 'result')
    }

    // TODO better error handling
    throw new Error(_.get(response, 'error', 'unknown error'))
  }
}
