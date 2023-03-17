import { GeoContext } from '@proofzero/types/context'
import type { BaseMiddlewareFunction } from './types'

/**
 * Defines a middleware that extracts Cloudflare-provided geolocation
 * information from the request and places it into the RpcContext using
 * to convey context information between middleware.
 */

// geolocation
// -----------------------------------------------------------------------------

/**
 * An extension that populates the context with Cloudflare-provided
 * location information extracted from a Request.
 *
 * @returns the context map updated with geolocation information.
 */

export const cfGeoContext: BaseMiddlewareFunction<{
  req?: Request
}> = ({ ctx, next }) => {
  const req = ctx.req
  const pick = Object.assign(
    {},
    ...[
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
    ].map((key) => {
      if (Object.prototype.hasOwnProperty.call(ctx.req, key)) {
        if (req && key === 'cf') {
          return { [key]: req[key] }
        }
      }
    })
  )

  return next({
    ctx: {
      ...ctx,
      [GeoContext]: pick.cf,
    },
  })
}
