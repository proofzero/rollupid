import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyNetwork,
} from '@kubelt/packages/alchemy-client'

import type {
  GetNFTsResult,
  GetContractsForOwnerResult,
} from '@kubelt/packages/alchemy-client'
import type { Chain, NFT } from '~/types'
import { NFTContractNormalizer, NFTNormalizer } from './nfts'
import { sortNftsFn } from './strings'

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

// -------------------- ALL NFTS FOR SPECIFIED CONTRACTS -----------------------

export const getNftsForAllChains = async ({
  addresses,
  contractAddresses,
  maxRuns = 3,
}: {
  addresses: string[]
  contractAddresses: string[]
  maxRuns?: number
}) => {
  try {
    const [ethNfts, polyNfts] = await Promise.all([
      getNfts({
        addresses,
        contractAddresses,
        maxRuns,
        chain: AlchemyChain.ethereum,
      }),
      getNfts({
        addresses,
        contractAddresses,
        maxRuns,
        chain: AlchemyChain.polygon,
      }),
    ])

    return ethNfts.concat(polyNfts)
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return []
  }
}

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

    return {
      ownedNfts: ethereumContracts.concat(polygonContracts).sort(sortNftsFn),
    }
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return {
      ownedNfts: [] as NFT[],
    }
  }
}
