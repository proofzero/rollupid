// @kubelt/openrpc:middleware/authenticate.ts

/**
 * Provides a middleware that authenticates incoming requests.
 */

import * as jose from 'jose'

import type { RpcContext } from '@kubelt/openrpc'

import * as openrpc from '@kubelt/openrpc'

// authenticate
// -----------------------------------------------------------------------------

/**
 * An extension that validates a JWT in the request to ensure that the
 * request has the requisite permission(s) for the operation they're
 * trying to perform.
 *
 * @returns a HTTP 401 error if the JWT is invalid, otherwise returns
 * the context updated with the set of claims contained within the JWT.
 */
export default openrpc.middleware(
  async (request: Readonly<Request>, context: Readonly<RpcContext>) => {
    // TEMP just an example of using jose!
    const jwt = request.headers.get('JWT')

    if (jwt !== undefined && jwt !== null) {
      const publicKey = new TextEncoder().encode('FIXME')
      const { payload, protectedHeader } = await jose.jwtVerify(
        jwt,
        publicKey,
        {
          issuer: 'urn:example:issuer',
          audience: 'urn:example:audience',
        }
      )
      console.log(payload)
      console.log(protectedHeader)
    }

    // TODO
    return context
  }
)
