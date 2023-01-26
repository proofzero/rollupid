import { gatewayFromIpfs } from '@kubelt/utils'
import { getGalaxyClient } from './clients'

import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
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

export const getGallery = async (owner: string, jwt: string) => {
  // TODO: get from account
  const galaxyClient = await getGalaxyClient()
  const { profile } = await galaxyClient.getProfile(undefined, {
    [PlatformJWTAssertionHeader]: jwt,
  })
  console.log({ profile })
  return profile?.gallery || []
}

// ------ beginning of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS

const generateQuery = (params: any[]) => {
  const query = new URLSearchParams()
  params.forEach((param: any) => {
    if (param.value) {
      query.set(param.name, param.value)
    }
  })
  return query
}

const getMoreNfts = (fetcher: any, request: string) => {
  fetcher.load(request)
}

export const getMoreNftsGallery = (fetcher: any, accountURN: string) => {
  const query = generateQuery([{ name: 'owner', value: accountURN }])
  const request = `/nfts/gallery?${query}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsModal = (
  fetcher: any,
  accountURN: string,
  collection?: string,
  pageKey?: string
) => {
  const query = generateQuery([
    { name: 'owner', value: accountURN },
    { name: 'pageKey', value: pageKey },
    { name: 'collection', value: collection },
  ])
  if (collection) {
    getMoreNfts(fetcher, `/nfts/collection?${query}`)
  } else {
    getMoreNfts(fetcher, `/nfts?${query}`)
  }
}

export const getMoreNftsSingleCollection = (
  fetcher: any,
  accountURN: string,
  collection: string,
  pageKey?: string
) => {
  const query = generateQuery([
    { name: 'owner', value: accountURN },
    { name: 'pageKey', value: pageKey },
    { name: 'collection', value: collection },
  ])
  const request = `/nfts/collection?${query}`
  getMoreNfts(fetcher, request)
}

export const getMoreNftsAllCollections = (
  fetcher: any,
  accountURN: string,
  pageKey?: string
) => {
  const query = generateQuery([
    { name: 'owner', value: accountURN },
    { name: 'pageKey', value: pageKey },
  ])
  const request = `/nfts?${query}`
  getMoreNfts(fetcher, request)
}

// ------ end of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS

export const getGalleryWithMetadata = async (owner: string, jwt: string) => {
  const gallery = await getGallery(owner, jwt)

  if (!gallery || !gallery.length) {
    return { gallery: [] }
  }

  const galaxyClient = await getGalaxyClient()

  const { getNFTMetadataBatch: metadata } = await galaxyClient.getNFTMetadata(
    {
      input: gallery.map((nft: any) => ({
        contractAddress: nft.contract,
        tokenId: nft.tokenId,
      })),
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  const GalleryOrders: any = {}
  gallery?.forEach(
    (nft: { contract: string; tokenId: string; galleryOrder: number }) => {
      GalleryOrders[`${nft.contract}${nft.tokenId}`] = nft.galleryOrder
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
      galleryOrder: GalleryOrders[`${nft.contract?.address}${nft.id?.tokenId}`],
    }
  })

  /** Trick to perform permutation according to galleryOrder param  */
  const result = Array.from(Array((ownedNfts as any[]).length))
  ownedNfts?.forEach((nft) => (result[nft.galleryOrder] = nft))
  // Setup og tag data
  // check generate and return og image

  const filteredNfts =
    ownedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  return {
    gallery: filteredNfts,
  }
}
