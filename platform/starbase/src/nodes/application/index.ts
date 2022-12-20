/**
 * @module @kubelt/do.starbase
 * @file src/index.ts
 */

import * as _ from 'lodash'

import * as openrpc from '@kubelt/openrpc'

import type {
  RpcAlarm,
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  FieldAccess,
  alarm,
  component,
  field,
  method,
  requiredField,
  requiredScope,
  scopes,
} from '@kubelt/openrpc/component'

// The OpenRPC schema that defines the RPC API provided by the Durable Object.
import schema from './schema'

// StarbaseApplication
// -----------------------------------------------------------------------------
// A Durable Object for storing Kubelt Application state.

// TODO this decorator adds RPC methods that allow the component to
// be treated as a graph node.
// - [optional] constrain the types of edges
// - [optional] provide edge type (allowed properties)
// - [optional] constrain types of target node?
// - [optional] conform to EdgeStorage interface
//   - [default] ComponentStorage: store in DO state
//   - KVStorage: store in KV store
//   - D1Storage: store in D1 database
//   - RPCStorage: make remote RPC call to store edge
//@node()

// TODO list allowed signers (provide public key(s))
// @signer()

/**
 * Stores state that describes a Starbase application.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
// Should this version be an argument to @component(schema, "v1")?
//@version("v1")
@component(schema)
@scopes(['owner' /* 'starbase.read', 'starbase.write'*/])
@field({
  name: 'app',
  doc: 'An application object',
  defaultValue: {},
  /*
  scopes: {
    read: ["starbase.read"],
    write: ["starbase.write"],
  },
  validator: (x) => { return true },
  schemas: {
    v1: {
    }
    v2: {
      up: () => {
        // up migrate to new version
      }
      down: () => {
        // down migrate to old version
      }
      }
  }
  */
})
@field({
  name: 'published',
  doc: 'Application publication flag',
  defaultValue: false,
})
@field({
  name: 'clientId',
  doc: 'The OAuth client id for the application',
  defaultValue: '',
})
@field({
  name: 'secret',
  doc: 'The OAuth client secret for the application',
  defaultValue: '',
})
export class StarbaseApplication {
  // init
  // ---------------------------------------------------------------------------
  // Store the initial copy of the application record. Used to set up
  // fixture nodes for internal platform apps, which is why it updates
  // the secret. Once we no longer need to initialize the platform in
  // this way we can remove this method.

  @method('init')
  //@requiredScope('starbase.write')
  @requiredField('clientName', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('clientId', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('timestamp', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('app', [FieldAccess.Read, FieldAccess.Write])
  init(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    if (!params.has('clientId') || !params.has('clientName')) {
      const message = `missing parameter "clientId" or "clientName" from request`
      // TODO need a better way to return errors:
      // - additional RpcCallable parameter that is an error map; errors
      //   set on that map trigger the return of a JSON-RPC error
      //   response.
      // - exceptions
      return Promise.resolve({
        error: message,
      })
    }

    const clientId = params.get('clientId')
    const clientName = params.get('clientName')

    const timestamp = Date.now()

    output.set('clientId', clientId)
    output.set('clientName', clientName)

    output.set('app', {
      timestamp,
      title: clientName,
    })

    return Promise.resolve(true)
  }

  // update
  // ---------------------------------------------------------------------------

  // Mark this method as being the implementation of the update method
  // from the OpenRPC schema.
  @method('update')
  // The write scope is required to invoke this method. If the caller
  // lacks the scope they receive an error method indicating that they
  // lack permission, and this method handler is not invoked.
  //@requiredScope('starbase.write')
  // Allow this method to update the value of the "app" field of the
  // component.
  @requiredField('profile', [FieldAccess.Read, FieldAccess.Write])
  // The RPC method implementation.
  async update(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    if (!params.has('profile')) {
      const message = `missing parameter "profile" from request`
      // TODO need a better way to return errors:
      // - additional RpcCallable parameter that is an error map; errors
      //   set on that map trigger the return of a JSON-RPC error
      //   response.
      // - exceptions
      return Promise.resolve({
        error: message,
      })
    }

    // Read the supplied "profile" request parameter and write it to the
    // output "app" field, merging with the existing app data.
    const app = input.get('app')
    const profile = params.get('profile')

    // Make sure there's nothing sensitive in the parameters being
    // updated.
    //
    // NB: that no extraneous fields are set should eventually be
    // validated by application of the schema.
    // TODO: add separate fields for secure / sensitive data
    const updated = _.merge(
      app,
      _.omit(profile, ['clientId', 'clientSecret', 'published'])
    )
    output.set('app', updated)

    return Promise.resolve({
      profile,
    })
  }

  // fetch
  // ---------------------------------------------------------------------------

  @method('fetch')
  //@requiredScope('starbase.read')
  @requiredField('app', [FieldAccess.Read])
  @requiredField('clientId', [FieldAccess.Read])
  appFetch(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    const clientId = input.get('clientId')
    const app = input.get('app')

    return Promise.resolve({
      clientId,
      app,
    })
  }

  // profile
  // ---------------------------------------------------------------------------

  @method('profile')
  //@requiredScope('starbase.read')
  @requiredField('app', [FieldAccess.Read])
  @requiredField('published', [FieldAccess.Read])
  profile(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    const app = input.get('app')
    const published = input.get('published')

    // If the application is not published we shouldn't return any
    // information.
    let profile = {}
    if (published == true) {
      // These fields are stored separately, but out of an abundance of
      // caution we make sure they're not present in the returned profile.
      profile = _.omit(app, ['clientSecret', 'published'])
    }

    return Promise.resolve(profile)
  }

  // hasSecret
  // -----------------------------------------------------------------------------

  @method('hasSecret')
  //@requiredScope()
  @requiredField('secret', [FieldAccess.Read])
  hasSecret(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    const secret = input.get('secret')
    const exists = _.isString(secret) && _.trim(secret) !== ''

    return Promise.resolve(exists)
  }

  // rotateSecret
  // ---------------------------------------------------------------------------

  @method('rotateSecret')
  //@requiredScope()
  @requiredField('secret', [FieldAccess.Write])
  rotateSecret(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    // The new hashed secret is provided in the request.
    const secret = params.get('secret')
    output.set('secret', secret)

    return Promise.resolve(true)
  }

  // publish
  // ---------------------------------------------------------------------------
  // Note that this method simply sets the publication flag as
  // requested. Any validation of the application data that needs to
  // happen before the app is published is expected to happen in the
  // worker.

  @method('publish')
  //@requiredScope()
  @requiredField('published', [FieldAccess.Write])
  publish(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    const published = params.get('published')
    output.set('published', published)

    return Promise.resolve({ published })
  }

  // ---------------------------------------------------------------------------
  // COMPONENT
  // ---------------------------------------------------------------------------

  // rpc.discover
  // ---------------------------------------------------------------------------
  // Fetch the schema declared by the component.
  //
  // NB: this is a native feature of our underlying OpenRPC library. We don't
  // need special support for it at the component level, unlike with our extensions.

  // cmp.delete
  // ---------------------------------------------------------------------------
  // NB: we delete a durable object by deleting everything within it
  // (storage.deleteAll). Once the DO shuts down the DO ceases to exist.

  // cmp.scopes
  // -----------------------------------------------------------------------------
  // Returns a list of the scopes declared by the component.
} // END StarbaseApp
