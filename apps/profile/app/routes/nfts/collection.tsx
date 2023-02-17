import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalaxyClient } from '~/helpers/clients'
import { decorateNft, decorateNfts } from '~/helpers/nfts'
import { getProfileSession } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url)

  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken

  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    throw new Error('Owner required')
  }

  console.log({ owner })

  const collection = srcUrl.searchParams.get('collection')
  if (!collection) {
    throw new Error('Collection required')
  }

  const galaxyClient = await getGalaxyClient()
  const { nftsForAddress: resColl } = await galaxyClient.getNftsForAddress(
    {
      owner,
      contractAddresses: [collection],
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const ownedNfts = resColl?.ownedNfts.map((nft: any) => {
    return decorateNft(nft)
  })

  return json({
    ownedNfts: decorateNfts(ownedNfts),
  })
}
