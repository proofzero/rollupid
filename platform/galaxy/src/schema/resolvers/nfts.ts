import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { AddressURN } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { Nft, NftContract, NftContracts, Resolvers } from './typedefs'
import { Profile } from '@kubelt/platform.account/src/types'
import Env from '../../env'
import {
  AlchemyChain,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import { NodeType } from '@kubelt/types/address'

import {
  hasApiKey,
  setupContext,
  logAnalytics,
  getAllNfts,
  sortNftsAlphabetically,
  getNftsForAllChains,
  getAlchemyClients,
  nftBatchesFetcher,
  getNftMetadataForAllChains,
  nftBatchesFetcherForAllChains,
  beautifyContractsForAllChains,
  beautifyContracts,
  getConnectedCryptoAddresses,
  fetchContracts,
} from './utils'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
  addressURN: AddressURN
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
      { env, jwt }: ResolverContext
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
      { env, jwt }: ResolverContext
    ) => {
      console.log(
        `galaxy.contractsForAddress: getting contracts for account: ${owner}`
      )

      const accountURN = owner as AccountURN
      const addresses: string[] = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      const alchemyClients = getAlchemyClients({ env })
      const contracts: {
        ethereum: NftContract[]
        polygon: NftContract[]
      } = await fetchContracts({
        addresses,
        alchemyClients,
        excludeFilters,
      })

      const { ethereumNfts, polygonNfts } = await nftBatchesFetcherForAllChains(
        {
          contracts,
          addresses,
          alchemyClients,
        }
      )

      const result = beautifyContractsForAllChains([
        {
          nfts: ethereumNfts,
          chain: AlchemyChain.ethereum,
          contracts: contracts.ethereum,
          network: env.ALCHEMY_ETH_NETWORK,
        },
        {
          nfts: polygonNfts,
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
  'Query.nftsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.contractsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.getNFTMetadataBatch': [setupContext(), logAnalytics()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
