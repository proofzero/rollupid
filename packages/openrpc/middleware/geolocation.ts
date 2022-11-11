// @kubelt/openrpc:middleware/geolocation.ts

/**
 * Defines a middleware that extracts Cloudflare-provided geolocation
 * information from the request and places it into the RpcContext using
 * to convey context information between middleware.
 */

// TODO implement guards for middleware that assert what data they expect to be in the context
// TODO support namespacing in middleware; set reverse-TLD namespace into which context values will be set

import * as _ from 'lodash'

import type { RpcContext } from '@kubelt/openrpc'

import * as openrpc from '@kubelt/openrpc'

// geolocation
// -----------------------------------------------------------------------------

/**
 * An extension that populates the context with Cloudflare-provided
 * location information extracted from a Request.
 *
 * @returns the context map updated with geolocation information.
 */
export default openrpc.middleware(
  async (request: Readonly<Request>, context: Readonly<RpcContext>) => {
    // TODO make this a Map.
    const pick = _.pick(request, [
      'cf.asOrganization',
      'cf.city',
      'cf.colo',
      'cf.continent',
      'cf.country',
      'cf.latitude',
      'cf.longitude',
      'cf.postalCode',
      'cf.region',
      'cf.regionCode',
      'cf.timezone',
    ])
    const geo = _.get(pick, 'cf')

    // NB: this mutates context.
    _.set(context, 'com.kubelt.geo/location', geo)

    return context
  }
)
