import { GraphQLError } from 'graphql'

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

const getChainWithNetwork = (chain: AlchemyChain, env: Env): Chain => {
  return chain === AlchemyChain.ethereum
    ? {
        chain: AlchemyChain.ethereum,
        network: AlchemyNetwork[env.ALCHEMY_ETH_NETWORK],
      }
    : {
        chain: AlchemyChain.polygon,
        network: AlchemyNetwork[env.ALCHEMY_POLYGON_NETWORK],
      }
}

export const getAlchemyClient = (chain: Chain, env: Env): AlchemyClient => {
  return new AlchemyClient({
    key:
      chain.chain === 'eth'
        ? env.APIKEY_ALCHEMY_ETH
        : env.APIKEY_ALCHEMY_POLYGON,
    ...chain,
  })
}

export const getAlchemyClients = (env: Env) => {
  return {
    ethereumClient: getAlchemyClient(
      getChainWithNetwork(AlchemyChain.ethereum, env),
      env
    ),
    polygonClient: getAlchemyClient(
      getChainWithNetwork(AlchemyChain.polygon, env),
      env
    ),
  }
}

// -------------------- ALL NFTS FOR SPECIFIED CONTRACTS -----------------------

export const getNfts = async (
  {
    addresses,
    contractAddresses,
    maxRuns = 3,
    chain,
  }: {
    addresses: string[]
    contractAddresses: string[]
    maxRuns?: number
    chain: AlchemyChain
  },
  env: Env
) => {
  const chainWithNetwork = getChainWithNetwork(chain, env)
  const alchemyClient = getAlchemyClient(chainWithNetwork, env)

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

export const getContracts = async (
  {
    addresses,
    excludeFilters,
    maxRuns = 3,
    chain,
  }: {
    addresses: string[]
    excludeFilters: string[]
    maxRuns?: number
    chain: AlchemyChain
  },
  env: Env
) => {
  const chainWithNetwork = getChainWithNetwork(chain, env)
  const alchemyClient = getAlchemyClient(chainWithNetwork, env)
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

export const getContractsForAllChains = async (
  {
    addresses,
    excludeFilters,
  }: {
    addresses: string[]
    excludeFilters: string[]
  },
  env: Env
) => {
  // To avoid duplication - if one collection comes from different addresses
  const visitedContracts = new Map<string, boolean>()

  try {
    const [ethereumContracts, polygonContracts] = await Promise.all([
      getContracts(
        {
          addresses,
          excludeFilters,
          chain: AlchemyChain.ethereum,
        },
        env
      ),
      getContracts(
        {
          addresses,
          excludeFilters,
          chain: AlchemyChain.polygon,
        },
        env
      ),
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
    console.error(new GraphQLError(ex as string))
    return {
      ownedNfts: [] as NFT[],
    }
  }
}

export const getValidGallery = async (
  {
    gallery,
    accountURN,
  }: {
    gallery: Gallery
    accountURN: AccountURN
  },
  env: Env,
  traceSpan: TraceSpan
) => {
  const { ethereumClient, polygonClient } = getAlchemyClients(env)

  const cryptoAddresses = await getAccountCryptoAddresses(
    {
      accountURN,
    },
    env,
    traceSpan
  )

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
