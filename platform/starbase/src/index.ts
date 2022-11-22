// platform/starbase/src/index.ts

/**
 * This Cloudflare worker provides an OpenRPC backend for the Kubelt
 * Starbase application.
 *
 * @packageDocumentation
 */

import * as _ from 'lodash'

import * as set from 'ts-set-utils'

import * as openrpc from '@kubelt/openrpc'

import invariant from 'tiny-invariant'

import type {
  RpcAuthHandler,
  RpcContext,
  RpcRequest,
  RpcService,
} from '@kubelt/openrpc'

import { default as mwAnalytics } from '@kubelt/openrpc/middleware/analytics'
import { default as mwAuthenticate } from '@kubelt/openrpc/middleware/authenticate'
import { default as mwDatadog } from '@kubelt/openrpc/middleware/datadog'
import { default as mwGeolocation } from '@kubelt/openrpc/middleware/geolocation'
import { default as mwOnlyLocal } from '@kubelt/openrpc/middleware/local'
import { default as mwOort } from '@kubelt/openrpc/middleware/oort'

import { StarbaseApplication } from '@kubelt/do.starbase-application'
import { StarbaseContract } from '@kubelt/do.starbase-contract'
import { StarbaseUser } from '@kubelt/do.starbase-user'

import * as oauth from './oauth'
import * as secret from './secret'
import * as tokenUtil from './token'

import { KEY_REQUEST_ENV } from '@kubelt/openrpc/constants'

import type {
  Scope,
} from '@kubelt/security/scopes'

import { SCOPES_JSON } from '@kubelt/security/scopes'

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

// Context key for a KV store binding containing fixture data.
const KEY_FIXTURES = 'com.kubelt.kv/fixtures'
// Context key for a KV store binding containing a client ID => app ID mapping.
const KEY_LOOKUP = 'com.kubelt.kv/lookup'

// Context key for the KV value containing the Datadog API token.
const KEY_DATADOG = 'com.datadog/token'

// Context key for the JWT associated with the incoming request.
const KEY_TOKEN = 'com.kubelt.security/jwt'
// Context key for the user ID associated with the request (if any).
const KEY_USER_ID = 'com.kubelt.security/user.id'

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

// Auth
// -----------------------------------------------------------------------------
// A check applied on RPC methods that require authorization.

/**
 * Forward request to authorization service. This throws if the
 * authentication doesn't succeed. It relies on service bindings to
 * communicate with the "account" authorization service available as
 * env.Account.
 *
 * @returns nothing if auth succeeds, an error response otherwise
 */
const authCheck: RpcAuthHandler = async (
  request: Readonly<Request>,
  context: Readonly<RpcContext>
): Promise<void | Response> => {
  // We need to supply a service binding for the Account service to
  // perform the auth check.
  const env = context.get(KEY_REQUEST_ENV)
  if (undefined === env || '' === env) {
    throw new Error("missing environment; can't perform auth check")
  }

  // Create a version of isAuthenticated() that doesn't require entire
  // Env, just the specific service binding proxy for Account?
  /*
  try {
    // NB: request must be cloned as it may only be read once.
    await isAuthenticated(request, env)
  } catch (err) {
    return new Response('Unauthorized', { status: 401 })
  }
  */
}

// Methods
// -----------------------------------------------------------------------------
// These are the method handler implementations for the RPC methods
// defined in the OpenRPC API schema.

// NB: we are not yet validating the incoming RPC request against the schema!

// kb_appCreate
// -----------------------------------------------------------------------------

/**
 * Implement the kb_appCreate schema method to create a new application
 * record.
 */
const kb_appCreate = openrpc.method(schema, {
  name: 'kb_appCreate',
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)
      // TODO better type for JWT?
      const token: string = context.get(KEY_TOKEN)

      const clientId = oauth.makeClientId()
      const clientSecret = oauth.makeClientSecret()
      const hashedSecret = await secret.hash(clientSecret)

      // When the component ID is undefined (neither .id or .name is set
      // as an option) a randomly assigned ID is used.
      const app = await openrpc.discover(sbApplication, {
        token,
        tag: 'starbase-app',
      })

      // We store the hashed version of the secret; the plaintext is
      // returned for one-time display to the user and is never again
      // available in unhashed form in the system.
      const result = app.appStore({
        clientId,
        clientSecret: hashedSecret,
      })

      // Get the ID of the created durable object and store it in the
      // mapping table.
      const appId: string = <string>app.$.id

      await lookup.put(clientId, appId)

      //console.log(`stored clientId:${clientId} => appId:${appId}`)

      // -----------------------------------------------------------------------
      // TODO record the fact that this app is owned by ownerId by
      // creating an edge (once that capability is online).
      // -----------------------------------------------------------------------

      const ownerId: string = _.get(request, ['params', 'ownerId']) || ''

      // Return clientId to caller to allow for later interaction with
      // app record.
      return openrpc.response(request, {
        ownerId,
        clientId,
        clientSecret,
      })
    }
  ),
})

// kb_appUpdate
// -----------------------------------------------------------------------------

const kb_appUpdate = openrpc.method(schema, {
  name: 'kb_appUpdate',
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    // Note that the request we are given is a parsed RpcRequest. It's not
    // an HTTP Request that we can forward directly to the durable object!
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)
      // The JWT provided with the current request.
      const token = context.get(KEY_TOKEN)

      // The user that owns the app is determined by the supplied token.
      const userId = tokenUtil.getUserId(token)
      if (undefined === userId) {
        throw new Error('missing user ID in JWT')
      }
      console.log(`storing app for user ${userId}`)

      const clientId = _.get(request, ['params', 'clientId'])
      if (clientId === undefined) {
        throw new Error(`missing clientId parameter`)
      }

      const appId = await lookup.get(clientId)
      if (appId === null) {
        throw new Error(`missing app ID mapping for ${clientId}`)
      }

      // TODO better typing, impl/jsonrpc utility?
      // TODO guarantee that only public fields are being stored; apply
      // schema to incoming profile data.
      // NB: we should always have data here after JSON-RPC checking in place
      const profile = _.get(request, ['params', 'profile'])
      if (profile === null) {
        throw new Error(`missing profile data`)
      }

      const app = await openrpc.discover(sbApplication, {
        // The object ID is contained in the lookup table.
        id: appId,
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })

      // Store application profile data in the app component.
      const appResult = await app.update({
        profile,
      })

      return openrpc.response(request, {
        userId,
        clientId,
        profile,
      })
    }
  ),
})

// kb_appDelete
// -----------------------------------------------------------------------------

const kb_appDelete = openrpc.method(schema, {
  name: 'kb_appDelete',
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const starbase: DurableObjectNamespace = context.get(KEY_APPLICATION)
      // TODO better token type
      const token: string = context.get(KEY_TOKEN)

      // TODO better typing
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      const clientId = _.get(request, ['params', 'clientId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === clientId) {
        throw new Error('missing clientId param')
      }

      // The mapping table stores the durable object ID for the
      // application core.
      const appId = await lookup.get(clientId)
      if (null === appId) {
        throw new Error('missing appId mapping')
      }

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(starbase, {
        id: appId,
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
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const token = context.get(KEY_TOKEN)

      // Get a reference to the StarbaseApplication Durable Object.
      const sbUser: DurableObjectNamespace = context.get(KEY_USER)
      // TODO better typing
      const userName = _.get(request, ['params', 'ownerId'])

      const user = await openrpc.discover(sbUser, {
        // Derive the name of the object from user ID.
        name: userName,
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-user',
      })

      // TODO implement graph linking
      // TODO filter the edges to only include those linking to apps.
      //const result = await user._.graph.edges()

      const result = await user.listApplications()

      return openrpc.response(request, {
        invoked: 'kb_appList',
        result,
      })
    }
  ),
})

// kb_appAuthCheck
// -----------------------------------------------------------------------------
// This method is for use during the auth flow.

const kb_appAuthCheck = openrpc.method(schema, {
  name: 'kb_appAuthCheck',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      // Our mapping from application OAuth client ID to internal app ID.
      const lookup = context.get(KEY_LOOKUP)
      // Get a reference to the StarbaseApplication Durable Object.
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      const clientId = _.get(request, ['params', 'clientId'])
      if (clientId == undefined || clientId === null || clientId === '') {
        throw new Error(`client ID was not supplied`)
      }

      const appId = await lookup.get(clientId)
      if (appId === null) {
        throw new Error(`missing app ID mapping for ${clientId}`)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        tag: 'starbase-app',
      })

      // The stored application data.
      const stored = await app.fetch()

      // The supplied scopes must be a *subset* of the scopes stored on
      // the application.
      const inputScopes = new Set(_.get(request, ['params', 'scopes']))
      const appScopes = new Set(_.get(stored, ['scopes']))
      const setCheck = set.subset(inputScopes, appScopes)

      // All of these fields must match identically.
      const input = {
        redirectURI: _.get(request, ['params', 'redirectURI']),
        clientId: _.get(request, ['params', 'clientId']),
        clientSecret: _.get(request, ['params', 'clientSecret']),
      }

      // Check that these supplied values match what is stored for the
      // application.
      const allowed =
        _.isEqual(input, _.pick(stored, _.keys(input))) && setCheck

      return openrpc.response(request, allowed)
    }
  ),
})

// kb_appScopes
// -----------------------------------------------------------------------------
// Return a list of scopes with their metadata.

const kb_appScopes = openrpc.method(schema, {
  name: 'kb_appScopes',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      return openrpc.response(request, {
        scopes: SCOPES_JSON,
      })
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
      const env: Env = context.get(KEY_ENVIRONMENT)
      const fixtures: KVNamespace = context.get(KEY_FIXTURES)
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // The keys that were updated, i.e. for which we found fixture
      // data, created a corresponding app core, and deleted the key.
      const keys = []

      //
      // StarbaseApplication: CONSOLE
      //

      // Fetch fixture data for "console" platform app.
      const consoleName = 'console'
      const consoleKey = `${env}-${consoleName}`
      const consoleData = await fixtures.get(consoleKey, { type: 'json' })
      const consoleSecret = _.get(consoleData, 'clientSecret')
      if (consoleSecret === undefined) {
        throw new Error(`console fixture missing "clientSecret" property`)
      }

      // If the key was not present we get a null response.
      if (consoleData) {
        // NB: when core .name or .id is undefined a randomly generated
        // ID is used.
        const con = await openrpc.discover(sbApplication, {
          tag: 'starbase-app',
        })
        const conResult = await con.init({
          app: _.set(consoleData, 'clientSecret', consoleSecret),
        })
        if (conResult.error) {
          throw new Error(conResult.error)
        }

        // Delete the stored fixture data now that the DO has been created.
        await fixtures.delete(consoleKey)

        const clientId = _.get(consoleData, 'clientId')
        if (clientId === undefined) {
          throw new Error(`console fixture missing "clientId" property`)
        }
        const appId: string = <string>con.$.id

        await lookup.put(clientId, appId)

        console.log(`console: clientId:${clientId} => appId:${appId}`)

        keys.push(consoleKey)
      }

      //
      // StarbaseApplication: THREEID
      //

      // Fetch fixture data for "threeid" platform app.
      const threeidName = 'threeid'
      const threeidKey = `${env}-${threeidName}`
      const threeidData = await fixtures.get(threeidKey, { type: 'json' })
      const threeidSecret = _.get(threeidData, 'clientSecret')
      if (threeidSecret === undefined) {
        throw new Error(`threeid fixture missing "clientSecret" property`)
      }

      // If the key was not present we get a null response.
      if (threeidData) {
        // NB: when core name is undefined a randomly generated ID is used.
        const threeid = await openrpc.discover(sbApplication, {
          tag: 'starbase-app',
        })
        const threeidResult = await threeid.init({
          app: _.set(threeidData, 'clientSecret', threeidSecret),
        })
        if (threeidResult.error) {
          throw new Error(threeidResult.error)
        }

        // Delete the stored fixture data now that the DO has been created.
        await fixtures.delete(threeidKey)

        const clientId = _.get(threeidData, 'clientId')
        if (clientId === undefined) {
          throw new Error(`threeid fixture missing "clientId" property`)
        }
        const appId: string = <string>threeid.$.id

        await lookup.put(clientId, appId)

        console.log(`threeid: clientId:${clientId} => appId:${appId}`)

        keys.push(threeidKey)
      }

      // RESULT

      return openrpc.response(request, {
        invoked: 'kb_initPlatform',
        keys,
      })
    }
  ),
})

// kb_appRotateSecret
// -----------------------------------------------------------------------------
// Generate a new secret and store in the application (keeping old
// secrets around).

const kb_appRotateSecret = openrpc.method(schema, {
  name: 'kb_appRotateSecret',
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const token = context.get(KEY_TOKEN)
      const userId = context.get(KEY_USER_ID)

      // TODO Generate new client secret
      // TODO trigger invalidation of access tokens?

      return openrpc.response(request, 'not yet implemented')
    }
  ),
})

// kb_appPublish
// -----------------------------------------------------------------------------
// Toggle the publication state of the application.

const kb_appPublish = openrpc.method(schema, {
  name: 'kb_appPublish',
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const token = context.get(KEY_TOKEN)
      const userId = context.get(KEY_USER_ID)

      return openrpc.response(request, 'not yet implemented')
    }
  ),
})

// kb_appProfile
// -----------------------------------------------------------------------------
// Return the public app profile.

const kb_appProfile = openrpc.method(schema, {
  name: 'kb_appProfile',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      const clientId = _.get(request, ['params', 'clientId'])
      if (!clientId) {
        throw new Error(`missing client ID`)
      }

      // Map the client ID into an application ID.
      const appId = await lookup.get(clientId)
      if (appId === null) {
        throw new Error(`missing app ID`)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        tag: 'starbase-app',
      })
      //console.log("clientId:", clientId)
      //console.log("   appId:", appId)
      //console.log("app.$.id:", app.$.id)
      invariant(appId === app.$.id, 'object IDs must match')

      const appProfile = await app.profile()

      return openrpc.response(request, appProfile)
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
  kb_appAuthCheck,
  kb_appCreate,
  kb_appDelete,
  kb_appList,
  kb_appProfile,
  kb_appPublish,
  kb_appRotateSecret,
  kb_appScopes,
  kb_appUpdate,
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
const rootPath = '/jsonrpc'

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

  // A mapping from application OAuth client ID to internall application ID.
  LOOKUP: KVNamespace

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

  // A binding to the authentication service.
  Account: Fetcher

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
    const context = openrpc.context(request, env, ctx)

    // Store the JWT associated with the request (if any).
    const token = tokenUtil.fromRequest(request)
    context.set(KEY_TOKEN, token)

    // Store the user ID associated with the request (if any).
    const userId = tokenUtil.getUserId(token)
    context.set(KEY_USER_ID, userId)

    // A secret value; the API token for Datadog metrics collection.
    context.set(KEY_DATADOG, env.DATADOG_TOKEN)
    // Store the current environment name, e.g. local, dev.
    context.set(KEY_ENVIRONMENT, env.ENVIRONMENT)

    // A KV store containing fixture data.
    context.set(KEY_FIXTURES, env.FIXTURES)
    // A KV store for mapping application client ID into app ID.
    context.set(KEY_LOOKUP, env.LOOKUP)

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
