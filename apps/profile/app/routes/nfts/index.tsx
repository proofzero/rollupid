import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalaxyClient } from '~/helpers/clients'
import { decorateNft, decorateNfts } from '~/helpers/nfts'

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url)

  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    return json({})
  }
  const galaxyClient = await getGalaxyClient()

  const { contractsForAddress: resColl } =
    await galaxyClient.getNftsPerCollection({
      owner,
      excludeFilters: ['SPAM'],
    })

  const ownedNfts = resColl?.contracts.map((contract: any) => {
    const nft: any = contract?.ownedNfts ? contract.ownedNfts[0] : {}
    return decorateNft(nft)
  })

  return json({
    ownedNfts: decorateNfts(ownedNfts),
  })
}
