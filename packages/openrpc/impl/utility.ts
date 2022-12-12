// @kubelt/openrpc:impl/utility.ts

/**
 * Miscellaneous utilities.
 */

import type { ParsedURN } from 'urns'

import * as urns from 'urns'

import { AnyURN } from '@kubelt/urns'

import type { RpcClientOptions } from './client'

// isIterable()
// -----------------------------------------------------------------------------

/**
 * Checks whether x is iterable or not.
 */
export function isIterable(x: any): boolean {
  // checks for null and undefined
  if (x == null) {
    return false
  }
  return typeof x[Symbol.iterator] === 'function'
}

// idFromOptions()
// -----------------------------------------------------------------------------

/**
 * Extract a durable object ID from client options. It's possible to specify an ID by providing:
 * - a "name" string property that is hashed
 * - an "id" string property that is a stringified object ID
 *
 * If neither is provided, an new, random, and unique ID is returned instead.
 */
export function idFromOptions(
  durableObject: DurableObjectNamespace,
  options: RpcClientOptions
): DurableObjectId {
  let objId: DurableObjectId

  if (Object.hasOwn(options, 'id')) {
    objId = durableObject.idFromString(options.id!)
  } else if (Object.hasOwn(options, 'name')) {
    objId = durableObject.idFromName(options.name!)
  } else if (Object.hasOwn(options, 'urn')) {
    const urn: AnyURN | ParsedURN<string, string> = options.urn!
    let parsedURN
    if (typeof urn === 'string') {
      parsedURN = urns.parseURN(urn)
    } else {
      parsedURN = urn
    }
    // Unparse the parsed URN in a bid to normalize it. Do we need/want
    // to do more here, e.g. sort the components to canonicalize?
    const name = urns.unparseURN(parsedURN).toString()
    objId = durableObject.idFromName(name)
  } else {
    objId = durableObject.newUniqueId()
  }

  return objId
}
