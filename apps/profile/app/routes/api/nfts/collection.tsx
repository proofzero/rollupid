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
    throw new Error('Owner required')
  }

  const collection = srcUrl.searchParams.get('collection')
  if (!collection) {
    throw new Error('Collection required')
  }

  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(context.traceSpan)
  )
  const { nftsForAddress: resColl } = await galaxyClient.getNftsForAddress(
    {
      owner,
      contractAddresses: [collection],
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return json({
    ownedNfts: resColl?.ownedNfts
      ? decorateNfts(resColl?.ownedNfts as Nft[])
      : [],
  })
}
