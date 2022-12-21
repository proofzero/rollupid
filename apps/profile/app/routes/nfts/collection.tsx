import { LoaderFunction, json } from '@remix-run/cloudflare'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/clients'

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
  const { nftsForAddress: res } = await galaxyClient.getNftsForAddress({
    owner,
    contractAddresses: [collection],
  })

  const ownedNfts = res?.ownedNfts.map((nft) => {
    const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
    let error = false
    if (nft.error) {
      error = true
    }
    return {
      url: gatewayFromIpfs(media?.raw),
      thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
      error: error,
      title: nft.title,
      collectionTitle: nft.contractMetadata?.name,
      properties: nft.metadata?.properties,
      details: [
        {
          name: 'NFT Contract',
          value: nft.contract?.address,
        },
        { name: 'NFT Standard', value: nft.contractMetadata?.tokenType },
      ],
    }
  })

  const filteredNfts =
    ownedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  return json({
    ownedNfts: filteredNfts,
  })
}
