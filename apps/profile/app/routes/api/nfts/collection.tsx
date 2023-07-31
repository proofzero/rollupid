import type { IdentityURN } from '@proofzero/urns/identity'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getAccessToken } from '~/utils/session.server'
import { getNfts } from '~/helpers/alchemy'
import { getIdentityCryptoAddresses } from '~/helpers/profile'
import type { AlchemyChain } from '@proofzero/packages/alchemy-client'
import { JsonError } from '@proofzero/utils/errors'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const jwt = await getAccessToken(request, context.env)

  const owner = srcUrl.searchParams.get('owner') as IdentityURN
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
    const addresses = await getIdentityCryptoAddresses(
      {
        jwt,
      },
      context.env,
      context.traceSpan
    )

    const nftsForIdentity = await getNfts(
      {
        addresses,
        contractAddresses: [collection],
        chain,
      },
      context.env
    )

    return json({
      ownedNfts: nftsForIdentity,
    })
  } catch (error) {
    throw JsonError(error, context.traceSpan.getTraceParent())
  }
}
