import type { AccountURN } from '@proofzero/urns/account'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { JsonError } from '@proofzero/utils/errors'

import { getAccessToken } from '~/utils/session.server'
import { getContractsForAllChains } from '~/helpers/alchemy'
import { getAccountCryptoAddresses } from '~/helpers/profile'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const jwt = await getAccessToken(request)

  const owner = srcUrl.searchParams.get('owner') as AccountURN
  if (!owner) {
    throw new Error('Owner is required')
  }

  try {
    const addresses = await getAccountCryptoAddresses({
      jwt,
      traceSpan: context.traceSpan,
    })

    const nftsForAccount = await getContractsForAllChains({
      addresses,
      excludeFilters: ['SPAM'],
    })

    return json({
      ...nftsForAccount,
    })
  } catch (error) {
    throw JsonError(error, context.traceSpan.getTraceParent())
  }
}
