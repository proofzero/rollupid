import { gatewayFromIpfs } from '@kubelt/utils'
import { getAccountProfile } from './profile'

import type { AccountURN } from '@kubelt/urns/account'
import type { Gallery, Nft } from '@kubelt/galaxy-client'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

/**
 * Nfts are being sorted server-side
 * this function then allows to merge client Nfts with newly-fetched Nfts
 * as two sorted arrays. In linear time
 */

export const capitalizeFirstLetter = (string?: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null
}

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
      value: BigInt(nft.id.tokenId).toString(10),
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
 * Returns target address gallery for which only
 * owner property is required.
 * @param owner AccountURN of target profile. Can be undefined if JWT is provided.
 * @returns Gallery or empty array
 */
export const getGallery = async (
  accountURN: AccountURN,
  traceSpan: TraceSpan
) => {
  const profile = await getAccountProfile({ accountURN }, traceSpan)
  const { gallery } = profile

  return { gallery: gallery || [] }
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

export const getMoreNftsModal = (
  fetcher: any,
  accountURN: string,
  collection?: string
) => {
  const query = generateQuery([
    { name: 'owner', value: accountURN },
    { name: 'collection', value: collection },
  ])
  if (collection) {
    getMoreNfts(fetcher, `/api/nfts/collection?${query}`)
  } else {
    getMoreNfts(fetcher, `/api/nfts?${query}`)
  }
}

// ------ end of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS
