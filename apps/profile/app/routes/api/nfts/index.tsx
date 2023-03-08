import type { Nft } from '@kubelt/galaxy-client'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalaxyClient } from '~/helpers/clients'
import { decorateNfts } from '~/helpers/nfts'
import { getProfileSession } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const srcUrl = new URL(request.url)

  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken

  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    return json({})
  }

  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(context.traceSpan)
  )
  const { contractsForAddress: resColl } =
    await galaxyClient.getNftsPerCollection(
      {
        owner,
        // Is supported ONLY on ethereum and polygon mainnets
        excludeFilters: ['SPAM'],
      },
      getAuthzHeaderConditionallyFromToken(jwt)
    )

  const ownedNfts: Nft[] =
    resColl?.contracts.map((contract: any) => {
      const nft: any = contract?.ownedNfts ? contract.ownedNfts[0] : {}
      return nft
    }) ?? []

  return json({
    ownedNfts: decorateNfts(ownedNfts),
  })
}
