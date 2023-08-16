import type { IdentityURN } from '@proofzero/urns/identity'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { JsonError } from '@proofzero/utils/errors'

import { getAccessToken } from '~/utils/session.server'
import { getContractsForAllChains } from '~/helpers/alchemy'
import { getIdentityCryptoAddresses } from '~/helpers/profile'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const jwt = await getAccessToken(request, context.env)

  const owner = srcUrl.searchParams.get('owner') as IdentityURN
  if (!owner) {
    throw new Error('Owner is required')
  }

  try {
    const addresses = await getIdentityCryptoAddresses(
      {
        jwt,
      },
      context.env,
      context.traceSpan
    )

    const nftsForIdentity = await getContractsForAllChains(
      {
        addresses,
        excludeFilters: ['SPAM'],
      },
      context.env
    )

    return json({
      ...nftsForIdentity,
    })
  } catch (error) {
    throw JsonError(error, context.traceSpan.getTraceParent())
  }
}
