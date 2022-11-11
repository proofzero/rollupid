// platform/starbase/src/index.ts

/**
 * This Cloudflare worker provides an OpenRPC backend for the Kubelt
 * Starbase application.
 *
 * @packageDocumentation
 */

import * as _ from 'lodash'

import * as openrpc from '@kubelt/openrpc'

import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import { default as mwAnalytics } from '@kubelt/openrpc/middleware/analytics'
import { default as mwAuthenticate } from '@kubelt/openrpc/middleware/authenticate'
import { default as mwDatadog } from '@kubelt/openrpc/middleware/datadog'
import { default as mwGeolocation } from '@kubelt/openrpc/middleware/geolocation'
import { default as mwOnlyLocal } from '@kubelt/openrpc/middleware/local'
import { default as mwOort } from '@kubelt/openrpc/middleware/oort'

import { StarbaseApplication } from '@kubelt/do.starbase-application'
import { StarbaseContract } from '@kubelt/do.starbase-contract'
import { StarbaseUser } from '@kubelt/do.starbase-user'

import * as secret from './secret'

// Schema
// -----------------------------------------------------------------------------

// Import the OpenRPC schema for this API.
import schema from './schema'

// Durable Objects
// -----------------------------------------------------------------------------
// We need to export any Durable Objects we use.

export { StarbaseApplication, StarbaseContract, StarbaseUser }

// Definitions
// -----------------------------------------------------------------------------

// Context key for a KV store binding.
const KEY_FIXTURES = 'com.kubelt.kv/fixtures'

// Context key for a KV value containing name of platform app core owner.
const KEY_PLATFORM_OWNER = 'com.kubelt.value/platform_owner'
// Context key for a KV value containing name of current environment.
const KEY_ENVIRONMENT = 'com.kubelt.value/environment'

// Context key for looking up StarbaseApplication durable object.
const KEY_APPLICATION = 'com.kubelt.object/application'
// Context key for looking up StarbaseContract durable object.
const KEY_CONTRACT = 'com.kubelt.object/contract'
// Context key for looking up StarbaseUser durable object.
const KEY_USER = 'com.kubelt.object/user'

// Scopes
// -----------------------------------------------------------------------------
// This service doesn't use scopes, we can use this everywhere a set of scopes
// are required.

const noScope = openrpc.scopes([])

// Methods
// -----------------------------------------------------------------------------
// These are the method handler implementations for the RPC methods
// defined in the OpenRPC API schema.

// NB: we are not yet validating the incoming RPC request against the schema!

// kb_appStore
// -----------------------------------------------------------------------------

const kb_appStore = openrpc.method(schema, {
  name: 'kb_appStore',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Note that the request we are given is a parsed RpcRequest. It's not
      // an HTTP Request that we can forward directly to the durable object!

      // Get a reference to the StarbaseApplication Durable Object.
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // TODO better typing
      const appData = _.get(request, ['params', 'app'], {})
      const ownerId = _.get(request, ['params', 'ownerId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === ownerId) {
        throw new Error('missing ownerId param')
      }
      const appId = _.get(request, ['params', 'appId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === appId) {
        throw new Error('missing appId param')
      }

      // Hash application clientSecret before storing in app core.
      const clientSecret = appData.clientSecret
      const hashedSecret = await secret.hash(clientSecret)
      //const cid = secret.parse(hashedSecret);
      appData.clientSecret = hashedSecret

      // TODO forward the JWT used to make the current request. Send as
      // "KBT-Authorization" header?
      const token = 'FIXME'

      // The name of the component that we need to update with new
      // application data.
      //
      // TODO Should we use randomly generated name for better
      // performance? Alternately, should we hash our own identifier into
      // a hex string to use as the name?
      const objName = `${ownerId}/${appId}`

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(sbApplication, objName, {
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })

      const result = await app.appStore({
        app: appData,
      })

      return openrpc.response(request, result)
    }
  ),
})

// kb_appFetch
// -----------------------------------------------------------------------------

const kb_appFetch = openrpc.method(schema, {
  name: 'kb_appFetch',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Get a reference to the StarbaseApplication Durable Object.
      const starbase: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // TODO better typing
      const ownerId = _.get(request, ['params', 'ownerId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === ownerId) {
        throw new Error('missing ownerId param')
      }
      const appId = _.get(request, ['params', 'appId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === appId) {
        throw new Error('missing appId param')
      }

      // TODO forward the JWT used to make the current request. Send as
      // "KBT-Authorization" header?
      const token = 'FIXME'

      // The name of the component that we need to update with new
      // application data.
      //
      // TODO Should we use randomly generated name for better
      // performance? Alternately, should we hash our own identifier into
      // a hex string to use as the name?
      const objName = `${ownerId}/${appId}`

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(starbase, objName, {
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })

      const result = await app.appFetch()

      return openrpc.response(request, result)
    }
  ),
})

// kb_appDelete
// -----------------------------------------------------------------------------

const kb_appDelete = openrpc.method(schema, {
  name: 'kb_appDelete',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Get a reference to the StarbaseApplication Durable Object.
      const starbase: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // TODO better typing
      const ownerId = _.get(request, ['params', 'ownerId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === ownerId) {
        throw new Error('missing ownerId param')
      }
      const appId = _.get(request, ['params', 'appId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === appId) {
        throw new Error('missing appId param')
      }

      // TODO forward the JWT used to make the current request. Send as
      // "KBT-Authorization" header?
      const token = 'FIXME'

      // The name of the component that we need to update with new
      // application data.
      //
      // TODO Should we use randomly generated name for better
      // performance? Alternately, should we hash our own identifier into
      // a hex string to use as the name?
      const objName = `${ownerId}/${appId}`

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(starbase, objName, {
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })

      const result = await app._.cmp.delete()

      return openrpc.response(request, result)
    }
  ),
})

// kb_appList
// -----------------------------------------------------------------------------

const kb_appList = openrpc.method(schema, {
  name: 'kb_appList',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Get a reference to the StarbaseApplication Durable Object.
      const sbUser: DurableObjectNamespace = context.get(KEY_USER)

      // TEMP
      const token = 'FIXME'
      const objName = '@kubelt/robert'

      const user = await openrpc.discover(sbUser, objName, {
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-user',
      })

      // TODO filter the edges to only include those linking to apps.
      const result = await user._.graph.edges()

      return openrpc.response(request, {
        invoked: 'kb_appList',
        implemented: false,
        result,
      })
    }
  ),
})

// kb_appAuthInfo
// -----------------------------------------------------------------------------
// This method is for use during the auth flow. It returns the auth-related
// details of an application.

const kb_appAuthInfo = openrpc.method(schema, {
  name: 'kb_appAuthInfo',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Get a reference to the StarbaseApplication Durable Object.
      const starbase: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // TODO better typing
      const ownerId = _.get(request, ['params', 'ownerId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === ownerId) {
        throw new Error('missing ownerId param')
      }
      const appId = _.get(request, ['params', 'appId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === appId) {
        throw new Error('missing appId param')
      }

      // TODO forward the JWT used to make the current request. Send as
      // "KBT-Authorization" header?
      const token = 'FIXME'

      // The name of the component that we need to update with new
      // application data.
      //
      // TODO Should we use randomly generated name for better
      // performance? Alternately, should we hash our own identifier into
      // a hex string to use as the name?
      const objName = `${ownerId}/${appId}`

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(starbase, objName, {
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })

      const result = await app.appFetch()

      // Keep only the app object properties that we want in the result.
      const authInfo = _.pick(result, [
        'app.id',
        'app.clientId',
        'app.redirectURL',
        'app.scopes',
      ])

      return openrpc.response(request, authInfo)
    }
  ),
})

// kb_initPlatform
// -----------------------------------------------------------------------------
// TODO add an option to allow an extension method to remain hidden,
// rather than adding it to the OpenRPC schema returned by the
// rpc.discover call.

const kb_initPlatform = openrpc.extension(schema, {
  schema: {
    name: 'kb_initPlatform',
    params: [],
    result: {
      name: 'keys',
      description: 'The KV keys set during initialization',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    errors: [],
  },
  scopes: openrpc.scopes([]),
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const env = context.get(KEY_ENVIRONMENT)
      const kv = context.get(KEY_FIXTURES)
      const ownerId = context.get(KEY_PLATFORM_OWNER)
      const starbase: DurableObjectNamespace = context.get(KEY_APPLICATION)

      const token = 'FIXME'

      // The keys that were updated, i.e. for which we found fixture
      // data, created a corresponding app core, and deleted the key.
      const keys = []

      //
      // CONSOLE
      //

      // Fetch fixture data for "console" platform app.
      const consoleName = 'console'
      const consoleKey = `${env}-${consoleName}`
      const consoleData = await kv.get(consoleKey, { type: 'json' })

      // If the key was not present we get a null response.
      if (consoleData) {
        const con = await openrpc.discover(
          starbase,
          `${ownerId}/${consoleName}`,
          {
            token,
            tag: 'starbase-app',
          }
        )

        const conResult = await con.appStore({
          app: consoleData,
        })

        // Delete the stored fixture data now that the DO has been created.
        await kv.delete(consoleKey)

        keys.push(consoleKey)
      }

      //
      // THREEID
      //

      // Fetch fixture data for "threeid" platform app.
      const threeidName = 'threeid'
      const threeidKey = `${env}-${threeidName}`
      const threeidData = await kv.get(threeidKey, { type: 'json' })

      // If the key was not present we get a null response.
      if (threeidData) {
        const threeid = await openrpc.discover(
          starbase,
          `${ownerId}/${threeidName}`,
          {
            token,
            tag: 'starbase-app',
          }
        )

        const threeidResult = await threeid.appStore({
          app: threeidData,
        })

        // Delete the stored fixture data now that the DO has been created.
        await kv.delete(threeidKey)

        keys.push(threeidKey)
      }

      // RESULT

      const result = {
        invoked: 'kb_initPlatform',
        keys,
      }
      return openrpc.response(request, result)
    }
  ),
})

// Service
// -----------------------------------------------------------------------------
// Define an OpenRPC service.

// This service doesn't current require scopes to invoke RPC methods.
const scopes = noScope

// These are the implementations of the RPC methods described in the schema.
const methods = openrpc.methods(schema, [
  kb_appAuthInfo,
  kb_appDelete,
  kb_appFetch,
  kb_appList,
  kb_appStore,
])

// These are RPC methods not described in the schema but which are provided
// by the service.
const extensions = openrpc.extensions(schema, [kb_initPlatform])

// Configuration options for the API.
const options = openrpc.options({
  // Enable OpenRPC service discovery.
  rpcDiscover: true,
})

// Supply implementations for all of the API methods in the schema.
const service = openrpc.service(schema, scopes, methods, extensions, options)

// Handler
// -----------------------------------------------------------------------------
// A handler is a function that accepts a JSON-RPC request and returns a JSON-RPC
// response. It deals with the machinery involved is mounting a service at a
// particular path, invokes middleware on the incoming request, and ultimately
// dispatches the request to the correct RPC service method.

// All requests whose path is "under" this location are handled by
// returning a 404 *unless* the request happens to be the root path.
// If the base path is the same as the root path, you will need to handle
// any request that isn't to the root path yourself.
const basePath = '/'

// The RPC resource endpoint; requests to this path are handled as RPC requests.
const rootPath = '/openrpc'

// Construct a sequence of middleware to execute before any RPC methods
// are invoked. These may short-circuit, directly returning a response
// to the incoming request, e.g. if authentication fails.
const chain = openrpc.chain([
  // This middleware rejects any requests that don't originate at
  // localhost.
  mwOnlyLocal,
  // Authenticate using a JWT in the request.
  mwAuthenticate,
  // Extra geolocation data provided by Cloudflare.
  mwGeolocation,
  // Cloudflare Worker analytics.
  mwAnalytics,
  // Construct a Datadog client for sending metrics.
  mwDatadog,
  // Construct an Oort client for talking to the Kubelt backend.
  mwOort,
])

// The returned handler validates the incoming request, routes it to the
// correct method handler, and executes the handler on the request to
// generate the response.
const rpcHandler = openrpc.build(service, basePath, rootPath, chain)

// Environment
// -----------------------------------------------------------------------------
// Describe the expected shape of the Cloudflare-provided environment.

export interface Env {
  // KV Namespaces
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/

  // The source of fixture data for platform app cores.
  FIXTURES: KVNamespace

  // Durable Objects
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/

  // A component representing a single Starbase application. This includes an OAuth
  // configuration profile and other metadata about the application.
  STARBASE_APP: StarbaseApplication

  // A component representing a proxied smart contract. Can be configured to proxy requests
  // to the remote contract, providing value-added capabilities along the way.
  STARBASE_CONTRACT: StarbaseContract

  // A component representing a Starbase user. Manages the references to other components
  // That the user owns.
  STARBASE_USER: StarbaseUser

  // Buckets
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/

  // The bucket where application icons are stored.
  //ICON_BUCKET: R2Bucket;

  // Service bindings
  // ---------------------------------------------------------------------------

  // A binding to the relay service.
  //AUTH: Auth;

  // Environment variables
  // ---------------------------------------------------------------------------

  // The name of the current deployment environment.
  ENVIRONMENT: string

  // The name of the owner of platform app cores.
  PLATFORM_OWNER: string

  // Secrets
  // ---------------------------------------------------------------------------

  // Datadog client token.
  DATADOG_TOKEN: string
}

// Worker
// -----------------------------------------------------------------------------

/**
 * @param request - A Request instance containing the request to handle.
 * @param env - An object containing environment bindings.
 * @param ctx - A request execution context.
 *
 * @returns An HTTP response.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // TODO forward request to authorization service.
    // NB: request must be cloned as it may only be read once.
    /*
    const authResponse = await env.AUTH.fetch(request.clone());
    if (!authResponse.ok) {
      return authResponse;
    }
    */

    // TEMP Install fixture data; there should be a core for the
    // "console" and for the "threeid" applications.
    // - create App DOs on first run?
    // - store data files in a KV and special case fetch them?
    // - add kbt_init handler that creates the fixtures, then invoke it from wrangler.toml build command?

    // Use this Map to inject per-request context into the request
    // handlers. This might include:
    // - environment variables
    // - service bindings
    // - bucket bindings
    // - kv bindings
    // - durable objects
    // etc.
    //
    // NB: this context is available to "extensions" (middleware) that
    // are executed as part of the request chain. That means you can add
    // API tokens here and construct clients in the middleware if they
    // need to be constructed dynamically. Note that it is idiomatic to
    // use reverse-TLD namespaced keys in the context map to allow
    // third-party extensions to avoid setting conflicting keys.
    //
    // NBB: secrets are set via the dashboard or using the wrangler CLI tool.

    // TODO allow context to be initialized in this function.
    const context = openrpc.context()

    // A secret value; the API token for Datadog metrics collection.
    context.set('com.datadog/token', env.DATADOG_TOKEN)

    // Store the current environment name.
    context.set(KEY_ENVIRONMENT, env.ENVIRONMENT)

    // Store the name of the owner of platform app cores.
    context.set(KEY_PLATFORM_OWNER, env.PLATFORM_OWNER)

    // A KV store containing fixture data.
    context.set(KEY_FIXTURES, env.FIXTURES)

    // A durable object containing Starbase App state.
    context.set(KEY_APPLICATION, env.STARBASE_APP)
    // A durable object containing Starbase App state.
    context.set(KEY_CONTRACT, env.STARBASE_CONTRACT)
    // A durable object containing Starbase App state.
    context.set(KEY_USER, env.STARBASE_USER)

    // NB: the handler clones the request; we don't need to do it here.
    return rpcHandler(request, context)
  },
}
