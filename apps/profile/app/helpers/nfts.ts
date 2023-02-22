import {
  gatewayFromIpfs,
  getAuthzHeaderConditionallyFromToken,
} from '@kubelt/utils'
import { getGalaxyClient } from './clients'
import {
  getAccountProfile,
  getAddressProfile,
  getAccountURNProfile,
} from './profile'

import type { AddressURN } from '@kubelt/urns/address'
import type { Gallery, Nft } from '@kubelt/galaxy-client'
import type { AccountURN } from '@kubelt/urns/account'
import { parseJwt } from '~/utils/session.server'
/**
 * Nfts are being sorted server-side
 * this function then allows to merge client Nfts with newly-fetched Nfts
 * as two sorted arrays. In linear time
 */

export const capitalizeFirstLetter = (string?: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null
}

export const createDetails = (nft: Nft) => {}

export type decoratedNft = {
  url?: string
  thumbnailUrl?: string
  error: boolean
  title?: Nft['title']
  contract: Nft['contract']
  tokenId?: string | null
  chain: Nft['chain']
  collectionTitle?: string | null
  properties?: any[] | null
  details: { name: string; value?: string | null; isCopyable: boolean }[]
}

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

export const decorateNft = (nft: Nft): decoratedNft => {
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
    {
      name: 'Chain',
      value: capitalizeFirstLetter(nft.chain?.chain),
      isCopyable: false,
    },
    {
      name: 'Network',
      value: capitalizeFirstLetter(nft.chain?.network),
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
    chain: nft.chain,
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

/**
 * Returns own gallery if JWT is provided or
 * target address gallery for which only
 * owner property is required.
 * @param owner AddressURN of target profile. Can be undefined if JWT is provided.
 * @param jwt JWT of requester
 * @returns Gallery or empty array
 */
export const getGallery = async (owner: string, jwt?: string) => {
  const isAccount = owner.includes('account')
  let checker: boolean = !!jwt
  if (isAccount)
    checker = jwt ? jwt.length > 0 && parseJwt(jwt).account === owner : false

  const profile = checker
    ? await getAccountProfile(jwt as string)
    : // if owner is an AccountURN - return from account,
    // else - return from address
    isAccount
    ? await getAccountURNProfile(owner as AccountURN)
    : await getAddressProfile(owner as AddressURN)

  const { gallery } = profile

  return gallery || []
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

export const getGalleryWithMetadata = async (owner: string, jwt?: string) => {
  const gallery = await getGallery(owner, jwt)

  if (!gallery || !gallery.length) {
    return { gallery: [] }
  }

  return await getGalleryMetadata(gallery, jwt)
}

export const getGalleryMetadata = async (gallery: Gallery[], jwt?: string) => {
  const galaxyClient = await getGalaxyClient()

  const { getNFTMetadataBatch: metadata } = await galaxyClient.getNFTMetadata(
    {
      input: gallery.map(
        (nft: { contract: string; tokenId: string; chain: string }) => ({
          contractAddress: nft.contract,
          tokenId: nft.tokenId,
          chain: nft.chain,
        })
      ),
    },
    // Optional for when called by
    // a non authenticated visitor
    // of a public profile
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const ownedNfts: decoratedNft[] | undefined = metadata?.ownedNfts.map(
    (nft) => {
      return decorateNft(nft as Nft)
    }
  )

  // Setup og tag data
  // check generate and return og image

  const filteredNfts =
    ownedNfts?.filter((n: decoratedNft) => !n.error && n.thumbnailUrl) || []

  return {
    gallery: filteredNfts,
  }
}
