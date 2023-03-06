import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { AddressURN } from '@kubelt/urns/address'
import { AccountURN } from '@kubelt/urns/account'

import { NftContract, Resolvers } from './typedefs'
import Env from '../../env'
import {
  AlchemyChain,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import {
  hasApiKey,
  setupContext,
  logAnalytics,
  sortNftsAlphabetically,
  getNftsForAllChains,
  getAlchemyClients,
  getNftMetadataForAllChains,
  normalizeContractsForAllChains,
  getConnectedCryptoAddresses,
  getContractsForAllChains,
  requestLogging,
} from './utils'
import { TraceSpan } from '@kubelt/platform-middleware/trace'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
  addressURN: AddressURN
  traceSpan: TraceSpan
}

const nftsResolvers: Resolvers = {
  Query: {
    // TODO: apply typing to the resolver:
    //@ts-ignore
    nftsForAddress: async (
      _parent: any,
      {
        owner,
        contractAddresses,
      }: {
        owner: string
        contractAddresses: string[]
      },
      { env, jwt, traceSpan }: ResolverContext
    ) => {
      logAnalytics(
        env.Analytics,
        'nftsForAddress',
        'query:gql',
        'BEFORE',
        owner
      )

      const accountURN = owner as AccountURN

      const addresses = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
        traceSpan,
      })

      const alchemyClients = getAlchemyClients({ env })

      const ownedNfts = await getNftsForAllChains(
        alchemyClients,
        addresses,
        contractAddresses
      )

      const sortedOwnedNfts = sortNftsAlphabetically(ownedNfts)

      return {
        ownedNfts: sortedOwnedNfts,
      }
    },
    //@ts-ignore
    contractsForAddress: async (
      _parent: any,
      {
        owner,
        excludeFilters = ['SPAM', 'AIRDROPS'],
        pageSize = 1,
      }: {
        owner: string
        excludeFilters: string[]
        pageSize: number
      },
      { env, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(
        `galaxy.contractsForAddress: getting contracts for account: ${owner}`
      )

      const accountURN = owner as AccountURN
      const addresses: string[] = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
        traceSpan,
      })

      const alchemyClients = getAlchemyClients({ env })
      const contracts: {
        ethereum: NftContract[]
        polygon: NftContract[]
      } = await getContractsForAllChains({
        addresses,
        alchemyClients,
        excludeFilters,
      })

      const result = normalizeContractsForAllChains([
        {
          chain: AlchemyChain.ethereum,
          contracts: contracts.ethereum,
          network: env.ALCHEMY_ETH_NETWORK,
        },
        {
          chain: AlchemyChain.polygon,
          network: env.ALCHEMY_POLYGON_NETWORK,
          contracts: contracts.polygon,
        },
      ])

      return {
        contracts: result,
      }
    },

    //@ts-ignore
    getNFTMetadataBatch: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          contractAddress: string
          tokenId: string
          chain: string
        }[]
      },
      { env }: ResolverContext
    ) => {
      const alchemyClients = getAlchemyClients({ env })
      const ownedNfts = await getNftMetadataForAllChains(
        input,
        alchemyClients,
        env
      )

      return {
        ownedNfts: NFTPropertyMapper(ownedNfts.filter((nft) => !nft.error)),
      }
    },
  },

  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.contractsForAddress': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.getNFTMetadataBatch': [
    requestLogging(),
    setupContext(),
    logAnalytics(),
  ],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
