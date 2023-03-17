import type { AccountURN } from '@proofzero/urns/account'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getProfileSession } from '~/utils/session.server'
import { getContractsForAllChains } from '~/helpers/alchemy'
import { getAccountCryptoAddresses } from '~/helpers/profile'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken

  const owner = srcUrl.searchParams.get('owner') as AccountURN
  if (!owner) {
    throw new Error('Owner is required')
  }

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
}
