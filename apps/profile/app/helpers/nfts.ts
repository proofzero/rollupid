import { gatewayFromIpfs } from '@proofzero/utils'

import type {
  AlchemyNFT,
  AlchemyContract,
  AlchemyChain,
} from '@proofzero/packages/alchemy-client'
import type { Chain, NFT, NFTDetail, NFTProperty } from '../types'
import { capitalizeFirstLetter } from './strings'

/**
 * Nfts are being sorted server-side
 * this function then allows to merge client Nfts with newly-fetched Nfts
 * as two sorted arrays. In linear time
 */

/** Function to compare two collections alphabetically */

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
  collection?: string,
  chain?: AlchemyChain
) => {
  const query = generateQuery([
    { name: 'owner', value: accountURN },
    { name: 'collection', value: collection },
    { name: 'chain', value: chain },
  ])
  if (collection) {
    getMoreNfts(fetcher, `/api/nfts/collection?${query}`)
  } else {
    getMoreNfts(fetcher, `/api/nfts?${query}`)
  }
}

// ------ end of the VERY HIGHLY IMPURE FUNCTIONS TO FETCH NFTS

export const NFTNormalizer = ({
  nfts,
  chain,
}: {
  nfts: AlchemyNFT[]
  chain: Chain
}): NFT[] => {
  return nfts
    .filter((nft) => {
      return (
        nft.contractMetadata?.tokenType !== 'UNKNOWN' &&
        (nft.error ? nft.error === 'false' || !nft.error : true)
      )
    })
    .map((nft) => {
      // ------ PROPERTIES MAPPING ---------------------------------------------
      let properties: {
        name: string
        value: string
        display: string
      }[] = []

      if (nft.metadata.attributes?.length) {
        const mappedAttributes = nft.metadata.attributes
          .filter((a) => a != null)
          .map((a) => ({
            name: a.trait_type,
            value: a.value,
            display: 'string',
          }))

        properties = properties.concat(mappedAttributes)
      }

      properties = properties.filter((p) => typeof p.value !== 'object')

      if (nft.metadata.attributes) {
        delete nft.metadata.attributes
      }

      // ------ DETAILS MAPPING ------------------------------------------------
      const media = Array.isArray(nft.media) ? nft.media[0] : nft.media

      const details = [
        {
          name: 'NFT Contract',
          value: nft.contract.address,
          isCopyable: true,
        },
        {
          name: 'NFT Standard',
          value: nft.contractMetadata.tokenType,
          isCopyable: false,
        },
        {
          name: 'Chain',
          value: capitalizeFirstLetter(chain.chain),
          isCopyable: false,
        },
        {
          name: 'Network',
          value: capitalizeFirstLetter(chain.network),
          isCopyable: false,
        },
        {
          name: 'Token ID',
          value: BigInt(nft.id.tokenId).toString(10),
          isCopyable: true,
        },
      ]

      return {
        url: gatewayFromIpfs(media?.raw),
        thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
        title: nft.title,
        contract: nft.contract,
        tokenId: nft.id?.tokenId,
        chain: chain,
        collectionTitle: nft.contractMetadata?.name,
        properties: properties,
        details,
      } as NFT
    })
}

export const NFTContractNormalizer = ({
  chain,
  contracts,
}: {
  chain: Chain
  contracts: AlchemyContract[]
}): NFT[] => {
  const beautifiedContracts = contracts
    .filter((ct) => {
      return !ct.isSpam && (ct.media.raw || ct.media[0].raw)
    })
    .map((ct) => {
      const media = Array.isArray(ct.media) ? ct.media[0] : ct.media

      return {
        url: gatewayFromIpfs(media?.raw),
        thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
        title: ct.title,
        contract: { address: ct.address },
        tokenId: ct.tokenId,
        chain: chain,
        collectionTitle: ct.name,

        /**
         * We don't care about properties and details in this call
         * Since it's just showing nfts of all contracts on the screen
         * For properties and details "NFTNormalizer" will be called
         * Even more - properties attribute isn't returned
         * on call for the contracts
         */
        properties: [] as NFTProperty[],
        details: [] as NFTDetail[],
      }
    })

  return beautifiedContracts
}
