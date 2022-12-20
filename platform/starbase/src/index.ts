// @kubelt/platform.starbase:/src/index.ts

/**
 * This Cloudflare worker provides an OpenRPC backend for the Kubelt
 * Starbase application.
 *
 * @packageDocumentation
 */

import * as _ from 'lodash'

import * as set from 'ts-set-utils'

import * as graph from '@kubelt/graph'

import * as openrpc from '@kubelt/openrpc'

import invariant from 'tiny-invariant'

//import { checkEnv } from '@kubelt/utils'

import { Edge, EdgeDirection } from '@kubelt/graph'

import type {
  RpcAuthHandler,
  RpcContext,
  RpcRequest,
  RpcService,
} from '@kubelt/openrpc'

import { default as mwAnalytics } from '@kubelt/openrpc/middleware/analytics'
import { default as mwAuthenticate } from '@kubelt/openrpc/middleware/authenticate'
import { default as mwGeolocation } from '@kubelt/openrpc/middleware/geolocation'
import { default as mwOnlyLocal } from '@kubelt/openrpc/middleware/local'

import { StarbaseApplication } from './nodes/application'
import * as oauth from './0xAuth'
import * as secret from './secret'
import * as tokenUtil from './token'

import { KEY_REQUEST_ENV } from '@kubelt/openrpc/constants'

import type { Scope } from '@kubelt/security/scopes'

import { SCOPES_JSON } from '@kubelt/security/scopes'

import type { ApplicationURN } from '@kubelt/urns/application'

import { ApplicationURNSpace } from '@kubelt/urns/application'

import type { AccountURN } from '@kubelt/urns/account'

import { AccountURNSpace } from '@kubelt/urns/account'

// Errors
// -----------------------------------------------------------------------------

import {
  ErrorInvalidPublishFlag,
  ErrorMappingClientId,
  ErrorMissingClientId,
  ErrorMissingClientName,
  ErrorMissingClientSecret,
  ErrorMissingProfile,
} from './error'

// Schema
// -----------------------------------------------------------------------------

// Import the OpenRPC schema for this API.
import schema from './schema'
import { ParamsArray } from '@kubelt/openrpc/impl/jsonrpc'

// Durable Objects
// -----------------------------------------------------------------------------
// We need to export any Durable Objects we use.

export { StarbaseApplication }

// Definitions
// -----------------------------------------------------------------------------

// The name of the edge tag used to link an account node and an
// application node.
const EDGE_TAG = 'owns/app'

// Context key for a KV store binding containing fixture data.
const KEY_FIXTURES = 'xyz.threeid.kv/fixtures'
// Context key for a KV store binding containing a client ID => app ID mapping.
const KEY_LOOKUP = 'xyz.threeid.kv/lookup'

// Context key for the KV value containing the Datadog API token.
const KEY_DATADOG = 'com.datadog/token'

// Context key for the JWT associated with the incoming request.
const KEY_TOKEN = 'xyz.threeid.security/jwt'
// Context key for the user ID associated with the request (if any).
const KEY_ACCOUNT_ID = 'xyz.threeid.security/account.id'

// Context key for a KV value containing name of current environment.
const KEY_ENVIRONMENT = 'xyz.threeid.value/environment'

// Context key for looking up StarbaseApplication durable object.
const KEY_APPLICATION = 'xyz.threeid.object/application'

// Context key for looking up the Account service stub.
const KEY_ACCESS = 'xyz.threeid.service/access'
// Context key for looking up the EDGES service stub.
const KEY_EDGES = 'xyz.threeid.service/edges'

// Scopes
// -----------------------------------------------------------------------------
// This service doesn't use scopes, we can use this everywhere a set of scopes
// are required.

const noScope = openrpc.scopes([])

// Auth
// -----------------------------------------------------------------------------
// A check applied on RPC methods that require authorization.

/**
 * Check that a JWT was included with the request, and that it includes
 * a valid account identifier if so. If the account ID is present it is
 * set on the context as the value of KEY_ACCOUNT_ID, making it
 * available in the RPC method handlers that use this auth handler.
 *
 * If the JWT is missing, if the account ID claim ("sub") is missing, or
 * if the account ID is not of the expected format, short-circuit to
 * return a 401 error.
 *
 * Note that we do not *yet* validate the signature of the token. This
 * will be handled by forwarding to an authentication service.
 *
 * @returns nothing if auth succeeds, an error response otherwise
 */
const authCheck: RpcAuthHandler = async (
  request: Readonly<Request>,
  context: Readonly<RpcContext>
): Promise<void | Response> => {
  const token = context.get(KEY_TOKEN)
  if (_.isUndefined(token) || token === '') {
    // No token was supplied with the request. That's a "no access
    // allowed" from me dawg.
    return new Response('Unauthorized. No token supplied with request.', {
      status: 401,
    })
  }

  let accountId
  try {
    // NB: decoding a signed JWT payload does not validate the JWT
    // Claims Set or values. This will be managed by authCheck, once
    // implemented (probably by forwarding to auth service).
    //
    // NB: this throws if no token was provided, or if the supplied
    // account URN isn't valid.
    accountId = tokenUtil.getAccountId(token)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(message, { status: 401 })
  }

  if (_.isUndefined(accountId)) {
    return new Response(
      'Unauthorized. No account id was found encoded in token.',
      { status: 401 }
    )
  }

  // Store the extracted account ID on the context for use in the method
  // handler.
  context.set(KEY_ACCOUNT_ID, accountId)
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
      const edges: Fetcher = context.get(KEY_EDGES)
      // TODO better type for JWT?
      const token: string = context.get(KEY_TOKEN)

      // NB: decoding a signed JWT payload does not validate the JWT
      // Claims Set or values. This will be managed by authCheck, once
      // implemented (probably by forwarding to auth service).
      //
      // NB: this throws if no token was provided, or if the supplied
      // account URN isn't valid.
      const accountURN = tokenUtil.getAccountId(token)
      if (!accountURN) {
        throw new Error('Account URN must be retrievable')
      }

      const tag = graph.edge(EDGE_TAG)

      const [clientName] = request.params as ParamsArray
      if (_.isUndefined(clientName)) {
        return openrpc.error(request, ErrorMissingClientName)
      }

      // Let's make sure this name is unique
      const linkedEdges = await graph.edges(edges, accountURN, tag)
      console.log({ linkedEdges })
      // TODO: check if the link already exists
      // if (linkedEdges?.filter(e => e.rComp.clientName))

      // Create initial OAuth configuration for the application. There
      // is no secret associated with the app after creation. The
      // kbt_rotateSecret method must be called to generate the initial
      // OAuth secret and return it to the caller.
      const clientId = oauth.makeClientId()

      // When the component ID is undefined (none of 'id', 'name', or
      // 'urn' is set as an option) a randomly assigned ID is used. The
      // object ID can be retrieved from the client as: stub.$.id.
      const app = await openrpc.discover(sbApplication, {
        // Forward the token sent with the request to the DO.
        token,
        tag: 'starbase-app',
      })
      // We store the hashed version of the secret; the plaintext is
      // returned for one-time display to the user and is never again
      // available in unhashed form in the system.
      // TODO: return a JsonRpcResponse or JsonRpcError
      const result = await app.init({
        clientId,
        clientName,
      })

      if (result.error) {
        console.error({ result })
        throw 'starbase.kb_appCreate: failed to create application'
      }

      // Get the ID of the created durable object and store it in the
      // mapping table.
      const appId: string = <string>app.$.id
      // Create a platform URN that uniquely represents the just-created
      // application.
      const appURN =
        ApplicationURNSpace.urn(appId) +
        `?+clientName=${encodeURIComponent(clientName)}`

      // We need to create an edge between the logged in user node (aka
      // account) and the new app.
      const src = accountURN
      const dst = appURN

      // TODO: return a JsonRpcResponse or JsonRpcError
      const edgeRes = await graph.link(edges, src, dst as ApplicationURN, tag)
      if (!(edgeRes as any).edge) {
        console.error({ edgeRes })
        await await app._.cmp.delete()
        throw `starbase.kb_appCreate: failed to create edge`
      }

      // Store an entry in the lookup KV that maps from application
      // client ID to internal application object ID.
      await lookup.put(clientId, appId)
      console.log(`stored clientId:${clientId} => appId:${appId}`)

      // Return clientId to caller to allow for later interaction with
      // app record.
      return openrpc.response(request, {
        account: accountURN,
        clientId,
        clientName,
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
      // This value is extracted by authCheck.
      const accountURN = context.get(KEY_ACCOUNT_ID) as AccountURN

      const clientId = _.get(request, ['params', 'clientId'])
      if (clientId === undefined) {
        return openrpc.error(request, ErrorMissingClientId)
      }

      const appId = await lookup.get(clientId)
      if (appId === null) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }

      // TODO better typing, impl/jsonrpc utility?
      // TODO guarantee that only public fields are being stored; apply
      // schema to incoming profile data.
      // NB: we should always have data here after JSON-RPC checking in place
      const profile = _.get(request, ['params', 'profile'])
      if (profile === null) {
        return openrpc.error(request, ErrorMissingProfile)
      }

      const app = await openrpc.discover(sbApplication, {
        // The object ID is contained in the lookup table.
        id: appId,
        // TODO This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // Store application profile data in the app component.
      const appResult = await app.update({
        profile,
      })

      return openrpc.response(request, {
        account: accountURN,
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
      const edges: Fetcher = context.get(KEY_EDGES)
      // TODO better token type
      const token: string = context.get(KEY_TOKEN)
      // This value is extracted by authCheck.
      const accountURN = context.get(KEY_ACCOUNT_ID) as AccountURN

      // TODO better typing
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      const clientId = _.get(request, ['params', 'clientId'])
      // TODO once we conformance check the request against the schema, we
      // can be sure that the required parameter(s) are present.
      if (undefined === clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }

      // The mapping table stores the durable object ID for the
      // application core.
      const appId = await lookup.get(clientId)
      if (null === appId) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }
      // Create a platform URN that uniquely represents the just-created
      // application.
      const appURN = ApplicationURNSpace.urn(appId)

      // Construct an RPC client for the named component (a durable
      // object) by calling its OpenRPC rpc.discover method and using the
      // returned schema to define an RPC proxy stub.
      const app = await openrpc.discover(starbase, {
        id: appId,
        // This auth token is sent with every RPC call.
        token,
        // This tag is used when logging requests.
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // Make a call to the remote edges service to remove the link
      // between the owning account node and the application node.
      const src = accountURN
      const dst = appURN
      const tag = graph.edge(EDGE_TAG)
      const edgeRes = await graph.unlink(edges, src, dst, tag)

      // Remove the entry from the client ID => object ID lookup table.
      await lookup.delete(clientId)

      // Tell the application Durable Object to delete any stored
      // state. This should lead to it being GC'ed.
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
      const edges: Fetcher = context.get(KEY_EDGES)

      // This value is extracted by authCheck.
      const accountURN = context.get(KEY_ACCOUNT_ID) as AccountURN

      const edgeTag = graph.edge(EDGE_TAG)

      // When an account owns an application, there is an edge *from*
      // the account node *to* the app node (direction = outgoing), with
      // edge type tag defined by EDGE_TAG.
      const edgeList = await graph.edges(
        edges,
        accountURN,
        edgeTag,
        EdgeDirection.Outgoing
      )

      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // The app nodes are the "destination" node of each returned edge,
      // an object provided as the .dst property. The node "id" property
      // has the shape: `urn:nid:nss`. More details about the node are
      // available on node object, if required. E.g. r-, q-,
      // f-component, or the full URN.

      const appList = []
      if (edgeList) {
        const edgeListArr = edgeList as Edge[]

        for (let i = 0; i < edgeListArr.length; i++) {
          const edge = edgeListArr[i]

          const app = await openrpc.discover(sbApplication, {
            token,
            tag: 'starbase-app',
            id: ApplicationURNSpace.decode(edge.dst.id as ApplicationURN),
          })

          const appListingDetails = await app.fetch()
          appList.push(appListingDetails)
        }
      }

      return openrpc.response(request, appList)
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
        return openrpc.error(request, ErrorMissingClientId)
      }

      const appId = await lookup.get(clientId)
      if (appId === null) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

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
      // AcmeCorp App
      //

      // Fetch fixture data for "console" platform app.
      const acmeName = 'acmecorp'
      const acmeKey = `${env}-${acmeName}`
      const acmeData = await fixtures.get(acmeKey, { type: 'json' })
      const acmeSecret: string = _.get(acmeData, 'clientSecret', '')

      if (acmeSecret === '') {
        console.error(`console fixture missing "clientSecret" property`)
      }
      const hashedSecret = await secret.hash(acmeSecret)

      // If the key was not present we get a null response.
      if (acmeData) {
        // NB: when core .name or .id is undefined a randomly generated
        // ID is used.
        const con = await openrpc.discover(sbApplication, {
          tag: 'acmecorp-app',
        })
        const conResult = await con.init({
          app: _.set(acmeData, 'clientSecret', hashedSecret),
        })
        if (conResult.error) {
          throw new Error(conResult.error)
        }

        // Delete the stored fixture data now that the DO has been created.
        await fixtures.delete(acmeKey)

        const clientId = _.get(acmeData, 'clientId')
        if (clientId === undefined) {
          throw new Error(`console fixture missing "clientId" property`)
        }
        const appId: string = <string>con.$.id

        await lookup.put(clientId, appId)

        console.log(`acmecorp: clientId:${clientId} => appId:${appId}`)

        keys.push(acmeKey)
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
  // TODO authCheck is currently a no-op
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const token = context.get(KEY_TOKEN)

      // Get the ID of the app that we are rotating the secret for.
      const [clientId] = request.params as ParamsArray

      // TODO once we conformance check the request against the schema,
      // we can be sure that the required parameter(s) are present.
      if (undefined === clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }

      // The mapping table stores the durable object ID for the
      // application core.
      const appId = await lookup.get(clientId)
      if (null === appId) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }
      // Create a platform URN that uniquely represents the just-created
      // application.
      const appURN = ApplicationURNSpace.urn(appId)
      console.log(`rotating secret for ${appURN}`)

      // Create an OAuth configuration for the application. The hashed
      // secret is stored in the application object; the plaintext
      // secret is returned from the call and is never seen in the
      // system as plaintext again.
      const clientSecret = oauth.makeClientSecret()
      const hashedSecret = await secret.hash(clientSecret)

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        // Forward the token sent with the request to the DO.
        token,
        // Use this string when logging DO requests.
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // Store the new secret for the application. This is
      // *destructive*.
      await app.rotateSecret({ secret: hashedSecret })

      return openrpc.response(request, {
        secret: clientSecret,
      })
    }
  ),
})

// kb_appRotateSecret
// -----------------------------------------------------------------------------
// Generate a new secret and store in the application (keeping old
// secrets around).

const kb_appRotateApiKey = openrpc.method(schema, {
  name: 'kb_appRotateApiKey',
  // TODO authCheck is currently a no-op
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)
      const lookup: KVNamespace = context.get(KEY_LOOKUP)

      // Get the ID of the app that we are rotating the secret for.
      const clientId = _.get(request, ['params', 'clientId'])

      // TODO once we conformance check the request against the schema,
      // we can be sure that the required parameter(s) are present.
      if (undefined === clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }
      // The mapping table stores the durable object ID for the
      // application core.
      const appId = await lookup.get(clientId)
      if (null === appId) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }
      // Create a platform URN that uniquely represents the just-created
      // application.
      const appURN = ApplicationURNSpace.urn(appId)
      console.log(`rotating API key for ${appURN}`)

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        // Forward the token sent with the request to the DO.
        urn: appURN,
        // Use this string when logging DO requests.
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      const apiKey = await app.rotateApiKey({ appId: appId, urn: appURN })

      return openrpc.response(request, {
        apiKey: apiKey,
      })
    }
  ),
})

// kb_appPublish
// -----------------------------------------------------------------------------
// Toggle the publication state of the application.

const kb_appPublish = openrpc.method(schema, {
  name: 'kb_appPublish',
  // TODO authCheck is currently a no-op
  auth: authCheck,
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const token = context.get(KEY_TOKEN)

      // Get the ID of the app that we are rotating the secret for.
      const clientId = _.get(request, ['params', 'clientId'])
      // TODO once we conformance check the request against the schema,
      // we can be sure that the required parameter(s) are present.
      if (undefined === clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }
      // The mapping table stores the durable object ID for the
      // application core.
      const appId = await lookup.get(clientId)
      if (null === appId) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }

      // This is the requested publication state of the application.
      const published = _.get(request, ['params', 'published'])
      if (typeof published !== 'boolean') {
        const detail = Object.assign(
          { data: { published } },
          ErrorInvalidPublishFlag
        )
        return openrpc.error(request, detail)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        // Forward the token sent with the request to the DO.
        token,
        // Use this string when logging DO requests.
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // If we're *unpublishing* the app, we don't need to validate the
      // app data.
      if (published === false) {
        app.publish({ published })
      } else {
        // Validate that the required configuration for the app has
        // been provided before allowing the user to publish it.
        const record = await app.fetch()
        const hasSecret = await app.hasSecret()
        // clientSecret
        if (!hasSecret) {
          return openrpc.error(request, ErrorMissingClientSecret)
        }
        // clientName
        const clientName = _.get(record, 'clientName')
        if (_.isUndefined(clientName) || clientName === '') {
          return openrpc.error(request, ErrorMissingClientName)
        }

        console.log(JSON.stringify(record, null, 2))
        app.publish({ published: true })
      }

      return openrpc.response(request, {
        clientId,
        published,
      })
    }
  ),
})

// kb_appDetails
// -----------------------------------------------------------------------------
// Return the app details.

const kb_appDetails = openrpc.method(schema, {
  name: 'kb_appDetails',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const lookup: KVNamespace = context.get(KEY_LOOKUP)
      const sbApplication: DurableObjectNamespace = context.get(KEY_APPLICATION)

      // This throws with a TypeError at runtime.
      const [clientId] = request.params as ParamsArray
      if (!clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }

      // Map the client ID into an application ID.
      const appId = await lookup.get(clientId)
      if (appId === null) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // NB: this returns an empty object if the application is not
      // published.
      const appDetails = await app.fetch()
      const hasSecret = (await app.hasSecret()) as boolean

      return openrpc.response(
        request,
        _.merge(appDetails, {
          hasSecret,
        })
      )
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

      // This throws with a TypeError at runtime.
      // const [clientId] = request.params as ParamsArray
      const clientId = _.get(request, ['params', 'clientId'])
      if (!clientId) {
        return openrpc.error(request, ErrorMissingClientId)
      }

      // Map the client ID into an application ID.
      const appId = await lookup.get(clientId)
      if (appId === null) {
        const detail = Object.assign(
          { data: { clientId } },
          ErrorMappingClientId
        )
        return openrpc.error(request, detail)
      }

      const app = await openrpc.discover(sbApplication, {
        id: appId,
        tag: 'starbase-app',
      })
      invariant(appId === app.$.id, 'object IDs must match')

      // NB: this returns an empty object if the application is not
      // published.
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
  kb_appDetails,
  kb_appProfile,
  kb_appPublish,
  kb_appRotateSecret,
  kb_appRotateApiKey,
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
  StarbaseApp: StarbaseApplication

  // Buckets
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/

  // The bucket where application icons are stored.
  //ICON_BUCKET: R2Bucket;

  // Service bindings
  // ---------------------------------------------------------------------------

  // A binding for the access service to enable auth checks.
  //ACCESS: Fetcher

  // A binding to the edges service; this service is used for storing
  // and querying links between nodes.
  Edges: Fetcher

  // Environment variables
  // ---------------------------------------------------------------------------

  // The name of the current deployment environment.
  ENVIRONMENT: string

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

    // TODO update this to check for newly required environments.
    //checkEnv(requiredEnv, env as unknown as Record<string, unknown>)

    // TODO allow context to be initialized in this function.
    const context = openrpc.context(request, env, ctx)

    // Store the JWT associated with the request (if any).
    const token = tokenUtil.fromRequest(request)
    context.set(KEY_TOKEN, token)

    // A secret value; the API token for Datadog metrics collection.
    context.set(KEY_DATADOG, env.DATADOG_TOKEN)
    // Store the current environment name, e.g. local, dev.
    context.set(KEY_ENVIRONMENT, env.ENVIRONMENT)

    // A KV store containing fixture data.
    context.set(KEY_FIXTURES, env.FIXTURES)
    // A KV store for mapping application client ID into app ID.
    context.set(KEY_LOOKUP, env.LOOKUP)

    // A durable object containing Starbase App state.
    context.set(KEY_APPLICATION, env.StarbaseApp)

    // A stub for invoking the edges service.
    context.set(KEY_EDGES, env.Edges)

    // NB: the handler clones the request; we don't need to do it here.
    return rpcHandler(request, context)
  },
}
