import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalaxyClient } from '~/helpers/clients'

import { loader as galleryLoader } from '~/routes/nfts/galleryFromD1'

import { gatewayFromIpfs } from '@kubelt/utils'

export const loader: LoaderFunction = async (args) => {
  const { gallery } = await (await galleryLoader(args)).json()

  const galaxyClient = await getGalaxyClient()

  const { getNFTMetadataBatch: metadata } = await galaxyClient.getNFTMetadata({
    input: gallery.map((nft: any) => ({
      contractAddress: nft.contract,
      tokenId: nft.tokenId,
    })),
  })

  const GalleryOrders: any = {}
  gallery?.forEach(
    (nft: {
      contract: string
      tokenId: string
      addressURN: string
      gallery_order: number
    }) => {
      GalleryOrders[`${nft.contract}${nft.tokenId}`] = nft.gallery_order
    }
  )

  const ownedNfts = metadata?.ownedNfts.map((nft) => {
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
      tokenId: nft.id?.tokenId,
      contract: nft.contract,
      collectionTitle: nft.contractMetadata?.name,
      properties: nft.metadata?.properties,
      details,
      gallery_order:
        GalleryOrders[`${nft.contract?.address}${nft.id?.tokenId}`],
    }
  })

  /** Trick to perform permutation according to gallery_order param  */
  const result = Array.from(Array(ownedNfts.length))
  ownedNfts?.forEach((nft) => (result[nft.gallery_order] = nft))
  // Setup og tag data
  // check generate and return og image

  const filteredNfts =
    result?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  return json({
    gallery: filteredNfts,
  })
}
