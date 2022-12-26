import { LoaderFunction, json } from '@remix-run/cloudflare'
import { gatewayFromIpfs } from '~/helpers'
import { getGalaxyClient } from '~/helpers/clients'
import { sortNftsFn } from '~/helpers/nfts'

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

    const details = [
      {
        name: 'NFT Contract',
        value: nft.contract?.address,
        isCopyable: true,
      },
      {
        name: 'NFT Standard',
        value: nft.contractMetadata?.tokenType,
        isCopyable: false,
      },
    ]
    if (nft.id && nft.id.tokenId) {
      details.push({
        name: 'Token ID',
        value: BigInt(nft.id?.tokenId).toString(10),
        isCopyable: true,
      })
    }

    return {
      url: gatewayFromIpfs(media?.raw),
      thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
      error: error,
      title: nft.title,
      collectionTitle: nft.contractMetadata?.name,
      properties: nft.metadata?.properties,
      details,
    }
  })

  const filteredNfts =
    ownedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  const sortedNfts = filteredNfts.sort(sortNftsFn)

  return json({
    ownedNfts: sortedNfts,
  })
}
