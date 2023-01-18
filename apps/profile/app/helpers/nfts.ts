import { AddressURNSpace } from '@kubelt/urns/address'
import { gatewayFromIpfs } from '@kubelt/utils'
import { getGalaxyClient, getIndexerClient } from './clients'

/**
 * Nfts are being sorted server-side
 * this function then allows to merge client Nfts with newly-fetched Nfts
 * as two sorted arrays. In linear time
 */

export const mergeSortedNfts = (a: any, b: any) => {
  var sorted = [],
    indexA = 0,
    indexB = 0

  while (indexA < a.length && indexB < b.length) {
    if (sortNftsFn(a[indexA], b[indexB]) > 0) {
      sorted.push(b[indexB++])
    } else {
      sorted.push(a[indexA++])
    }
  }

  if (indexB < b.length) {
    sorted = sorted.concat(b.slice(indexB))
  } else {
    sorted = sorted.concat(a.slice(indexA))
  }

  return sorted
}

/** Function to compare two collections alphabetically */
export const sortNftsFn = (a: any, b: any) => {
  if (b.collectionTitle === null) {
    return -1
  } else {
    return a.collectionTitle?.localeCompare(b.collectionTitle) || 1
  }
}

/**
 * Shared loader function to modify response from galaxy
 * and get representable nfts for our routes
 */

export const decorateNft = (nft: any) => {
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
    contract: nft.contract,
    tokenId: nft.id?.tokenId,
    collectionTitle: nft.contractMetadata?.name,
    properties: nft.metadata?.properties,
    details,
  }
}

/**
 * Sort and filter errors out
 */
export const decorateNfts = (ownedNfts: any) => {
  const filteredNfts =
    ownedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  const sortedNfts = filteredNfts.sort(sortNftsFn)
  return sortedNfts
}

export const getGallery = async (owner: string) => {
  const indexerClient = getIndexerClient()

  const urn = AddressURNSpace.urn(owner)
  const { gallery } = await indexerClient.getGallery.query([urn])

  return gallery
}

// ------ beginning of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS

const getMoreNfts = (fetcher: any, request: string) => {
  fetcher.load(request)
}

export const getMoreNftsGalleryModal = (
  fetcher: any,
  targetAddress: string,
  collection?: string,
  pageKey?: string
) => {
  const request = collection
    ? `/nfts/collection?owner=${targetAddress}${
        pageKey ? `&pageKey=${pageKey}` : ''
      }&collection=${collection}`
    : `/nfts?owner=${targetAddress}${pageKey ? `&pageKey=${pageKey}` : ''}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsGallery = (fetcher: any, targetAddress: string) => {
  const request = `/nfts/gallery?owner=${targetAddress}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsSettingsModal = (
  fetcher: any,
  targetAddress: string,
  collection?: string,
  pageKey?: string
) => {
  const request = collection
    ? `/nfts/collection?owner=${targetAddress}${
        pageKey ? `&pageKey=${pageKey}` : ''
      }&collection=${collection}`
    : `/nfts?owner=${targetAddress}${pageKey ? `&pageKey=${pageKey}` : ''}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsSingleCollection = (
  fetcher: any,
  targetAddress: string,
  collection: string,
  pageKey?: string
) => {
  const request = `/nfts/collection?owner=${targetAddress}${
    pageKey ? `&pageKey=${pageKey}` : ''
  }&collection=${collection}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsAllCollections = (
  fetcher: any,
  targetAddress: string,
  pageKey?: string
) => {
  const request = `/nfts?owner=${targetAddress}${
    pageKey ? `&pageKey=${pageKey}` : ''
  }`
  getMoreNfts(fetcher, request)
}

// ------ end of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS

export const getGalleryWithMetadata = async (owner: string) => {
  const gallery = await getGallery(owner)

  if (!gallery || !gallery.length) {
    return { gallery: [] }
  }

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
  const result = Array.from(Array((ownedNfts as any[]).length))
  ownedNfts?.forEach((nft) => (result[nft.gallery_order] = nft))
  // Setup og tag data
  // check generate and return og image

  const filteredNfts =
    ownedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  return {
    gallery: filteredNfts,
  }
}
