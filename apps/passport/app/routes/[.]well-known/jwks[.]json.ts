import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

import { getAccessClient } from '~/platform.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const client = getAccessClient(context.env, context.traceSpan)

    const requestUrl = new URL(request.url)
    const optionalParams = requestUrl.searchParams
    const issuerDomain = optionalParams.get('issuer_domain')
    let jwks

    if (issuerDomain) {
      const host = requestUrl.hostname
      //This is where the logic for custom domain JWKS retrieval comes in
      //For now we only implement Passport
      if (issuerDomain === host) {
        jwks = await client.getJWKS.query()
      } else {
        throw new BadRequestError({ message: 'Invalid issuer_domain provided' })
      }
    } else {
      //This is the regular (external) call made against the issuer domain directly
      //This will also need to be modified as part of custom domain implementation
      //to take current origin as a parameter
      jwks = await client.getJWKS.query()
    }
    return json(jwks)
  }
)
