import type { AccountURN } from '@proofzero/urns/account'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getAccessToken } from '~/utils/session.server'
import { getNfts } from '~/helpers/alchemy'
import { getAccountCryptoAddresses } from '~/helpers/profile'
import type { AlchemyChain } from '@proofzero/packages/alchemy-client'
import { JsonError } from '@proofzero/utils/errors'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const jwt = await getAccessToken(request)

  const owner = srcUrl.searchParams.get('owner') as AccountURN
  if (!owner) {
    throw new Error('Owner is required')
  }

  const collection = srcUrl.searchParams.get('collection')
  if (!collection) {
    throw new Error('Collection is required')
  }

  const chain = srcUrl.searchParams.get('chain') as AlchemyChain
  if (!chain) {
    throw new Error('Chain is required')
  }

  try {
    const addresses = await getAccountCryptoAddresses({
      jwt,
      traceSpan: context.traceSpan,
    })

    const nftsForAccount = await getNfts({
      addresses,
      contractAddresses: [collection],
      chain,
    })

    return json({
      ownedNfts: nftsForAccount,
    })
  } catch (error) {
    throw JsonError(error, context.traceSpan.getTraceParent())
  }
}
