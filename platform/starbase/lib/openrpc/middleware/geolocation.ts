/**
 * @file src/middleware/geolocation.ts
 */

// TODO implement guards for middleware that assert what data they expect to be in the context
// TODO support namespacing in middleware; set reverse-TLD namespace into which context values will be set

import * as _ from "lodash";

import type {
  RpcContext,
  RpcRequest,
} from "..";

import { middleware } from "..";

// geolocation
// -----------------------------------------------------------------------------

/**
 * An extension that populates the context with Cloudflare-provided
 * location information extracted from a Request.
 *
 * @return the context map updated with geolocation information.
 */
export default middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO make this a Map.
  const geo = _.pick(request, [
    "cf.colo",
    "cf.timezone",
    "cf.city",
    "cf.region",
    "cf.regionCode",
    "cf.postalCode",
  ]);
  // NB: this mutates context.
  _.set(context, "com.kubelt.geo/location", geo)
  return context;
});
