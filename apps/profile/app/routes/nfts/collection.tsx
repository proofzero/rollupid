import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalaxyClient } from '~/helpers/clients'
import { decorateNft, decorateNfts } from '~/helpers/nfts'

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url)

  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    throw new Error('Owner required')
  }

  const collection = srcUrl.searchParams.get('collection')
  if (!collection) {
    throw new Error('Collection required')
  }

  const galaxyClient = await getGalaxyClient()
  const { nftsForAddress: resColl } = await galaxyClient.getNftsForAddress({
    owner,
    contractAddresses: [collection],
  })

  const ownedNfts = resColl?.ownedNfts.map((nft: any) => {
    return decorateNft(nft)
  })

  return json({
    ownedNfts: decorateNfts(ownedNfts),
  })
}
