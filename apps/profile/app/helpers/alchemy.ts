import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyNetwork,
} from '@proofzero/packages/alchemy-client'

import type {
  GetNFTsResult,
  GetContractsForOwnerResult,
} from '@proofzero/packages/alchemy-client'
import type { Chain, Gallery, NFT } from '../types'
import { NFTContractNormalizer, NFTNormalizer } from './nfts'
import { sortNftsFn } from './strings'
import type { AccountURN } from '@proofzero/urns/account'
import { getAccountCryptoAddresses } from './profile'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'

// -------------------- TYPES --------------------------------------------------

const getChainWithNetwork = (chain: AlchemyChain): Chain => {
  return chain === AlchemyChain.ethereum
    ? {
        chain: AlchemyChain.ethereum,
        network: AlchemyNetwork[ALCHEMY_ETH_NETWORK],
      }
    : {
        chain: AlchemyChain.polygon,
        network: AlchemyNetwork[ALCHEMY_POLYGON_NETWORK],
      }
}

export const getAlchemyClient = (chain: Chain): AlchemyClient => {
  return new AlchemyClient({
    key: chain.chain === 'eth' ? APIKEY_ALCHEMY_ETH : APIKEY_ALCHEMY_POLYGON,
    ...chain,
  })
}

export const getAlchemyClients = () => {
  return {
    ethereumClient: getAlchemyClient(
      getChainWithNetwork(AlchemyChain.ethereum)
    ),
    polygonClient: getAlchemyClient(getChainWithNetwork(AlchemyChain.polygon)),
  }
}

// -------------------- ALL NFTS FOR SPECIFIED CONTRACTS -----------------------

export const getNfts = async ({
  addresses,
  contractAddresses,
  maxRuns = 3,
  chain,
}: {
  addresses: string[]
  contractAddresses: string[]
  maxRuns?: number
  chain: AlchemyChain
}) => {
  const chainWithNetwork = getChainWithNetwork(chain)
  const alchemyClient = getAlchemyClient(chainWithNetwork)

  const nfts: NFT[] = []
  await Promise.all(
    addresses.map(async (address) => {
      let runs = 0
      let pageKey
      do {
        const res = (await alchemyClient.getNFTs({
          owner: address,
          contractAddresses,
          pageKey,
        })) as GetNFTsResult

        nfts.push(
          ...NFTNormalizer({ nfts: res.ownedNfts, chain: chainWithNetwork })
        )

        pageKey = res.pageKey
      } while (pageKey && ++runs <= maxRuns)
    })
  )

  return nfts
}

// -------------------- ALL CONTRACTS ------------------------------------------

export const getContracts = async ({
  addresses,
  excludeFilters,
  maxRuns = 3,
  chain,
}: {
  addresses: string[]
  excludeFilters: string[]
  maxRuns?: number
  chain: AlchemyChain
}) => {
  const chainWithNetwork = getChainWithNetwork(chain)
  const alchemyClient = getAlchemyClient(chainWithNetwork)
  let contracts: NFT[] = []

  await Promise.all(
    addresses.map(async (address) => {
      let runs = 0
      let pageKey
      do {
        const res = (await alchemyClient.getContractsForOwner({
          address,
          pageKey,
          excludeFilters,
        })) as GetContractsForOwnerResult

        contracts = contracts.concat(
          NFTContractNormalizer({
            contracts: res.contracts,
            chain: chainWithNetwork,
          })
        )

        pageKey = res.pageKey
      } while (pageKey && ++runs <= maxRuns)
    })
  )

  return contracts
}

export const getContractsForAllChains = async ({
  addresses,
  excludeFilters,
}: {
  addresses: string[]
  excludeFilters: string[]
}) => {
  // To avoid duplication - if one collection comes from different addresses
  const visitedContracts = new Map<string, boolean>()

  try {
    const [ethereumContracts, polygonContracts] = await Promise.all([
      getContracts({
        addresses,
        excludeFilters,
        chain: AlchemyChain.ethereum,
      }),
      getContracts({
        addresses,
        excludeFilters,
        chain: AlchemyChain.polygon,
      }),
    ])

    const ownedNfts = ethereumContracts
      .concat(polygonContracts)
      .sort(sortNftsFn)
      .filter((nft) =>
        visitedContracts.has(nft.contract.address)
          ? false
          : visitedContracts.set(nft.contract.address, true)
      )

    return {
      ownedNfts,
    }
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return {
      ownedNfts: [] as NFT[],
    }
  }
}

export const getValidGallery = async ({
  gallery,
  accountURN,
  traceSpan,
}: {
  gallery: Gallery
  accountURN: AccountURN
  traceSpan: TraceSpan
}) => {
  const { ethereumClient, polygonClient } = getAlchemyClients()

  const cryptoAddresses = await getAccountCryptoAddresses({
    accountURN,
    traceSpan,
  })

  const [ethContractAddressesSet, polyContractAddressesSet] = gallery.reduce(
    ([ethereum, polygon], nft) => {
      // type error will go away after cleaning gallery schema
      nft.chain.chain === 'eth'
        ? ethereum.add(nft.contract.address)
        : polygon.add(nft.contract.address)
      return [ethereum, polygon]
    },
    [new Set([] as string[]), new Set([] as string[])]
  )

  const ethContractAddresses = Array.from(ethContractAddressesSet)
  const polyContractAddresses = Array.from(polyContractAddressesSet)

  /** Struct of this map is like this:
   {
    contractAddress1: [all tokens that user own in this contract],
    contractAddress2: [all tokens that user own in this contract],
    ...
    contractAddressN: [all tokens that user own in this contract],
    }
  */
  const validator = new Map<string, string[]>()

  const nfts: GetNFTsResult[] = (
    await Promise.all(
      cryptoAddresses.map((address) =>
        Promise.all([
          ethContractAddresses.length
            ? ethereumClient.getNFTs({
                owner: address,
                contractAddresses: ethContractAddresses,
              })
            : ({ ownedNfts: [] } as GetNFTsResult),
          polyContractAddresses.length
            ? polygonClient.getNFTs({
                owner: address,
                contractAddresses: polyContractAddresses,
              })
            : ({ ownedNfts: [] } as GetNFTsResult),
        ])
      )
    )
  ).flat()

  // .flat because previous Promise.all returns an array of arrays,
  // we just need internal arrays of nfts. These internal arrays are arrays
  // of objects with ownedNfts property
  // These methods populate validator map to then check if the user owns nfts.
  nfts.forEach((deeperNfts) => {
    deeperNfts.ownedNfts?.forEach((nft) => {
      const val = validator.get(nft.contract?.address as string)
      validator.set(
        nft.contract?.address as string,
        (val ? val : []).concat([nft.id?.tokenId as string])
      )
    })
  })

  return gallery.filter((nft) => {
    // type error will go away after cleaning gallery schema
    return validator.get(nft.contract.address)?.includes(nft.tokenId)
  })
}
