import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { Resolvers } from './typedefs'
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams,
  GetContractsForOwnerParams,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import { setupContext } from './utils'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
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
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      // console.log('owner', owner)
      // console.log('pageKey', pageKey)
      // console.log('pageSize', pageSize)

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_ETH_KEY,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const alchemyPolygonClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_POLYGON_KEY,
        chain: 'polygon',
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      try {
        let [alchemyRes, alchemyPolygonRes] = await Promise.all([
          alchemyClient.getNFTs({
            owner,
            contractAddresses,
          } as GetNFTsParams) as any,
          alchemyPolygonClient.getNFTs({
            owner,
            contractAddresses,
          } as GetNFTsParams) as any,
        ])

        let ownedNfts: any[] = []
        ownedNfts = ownedNfts.concat(NFTPropertyMapper(alchemyRes.ownedNfts))
        ownedNfts = ownedNfts.concat(
          NFTPropertyMapper(alchemyPolygonRes.ownedNfts)
        )

        // TOOD:
        // This is going to cause bugs
        // we need to reconsider pagination
        return {
          ...alchemyRes,
          ownedNfts,
        }
      } catch (ex) {
        throw new GraphQLYogaError(ex as string)
      }
    },
    //@ts-ignore
    contractsForAddress: async (
      _parent: any,
      {
        owner,
        pageKey,
        pageSize,
        excludeFilters,
      }: {
        owner: string
        pageKey: string
        pageSize: number
        excludeFilters: string[]
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_ETH_KEY,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const alchemyPolygonClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_POLYGON_KEY,
        chain: 'polygon',
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      // TODO: We need to reconsider pagination
      // here also
      let alchemyRes, alchemyPolygonRes
      try {
        ;[alchemyRes, alchemyPolygonRes] = await Promise.all([
          alchemyClient.getContractsForOwner({
            owner,
            pageKey,
            pageSize,
            excludeFilters,
          } as GetContractsForOwnerParams) as any,
          alchemyPolygonClient.getContractsForOwner({
            owner,
            pageKey,
            pageSize,
            excludeFilters,
          } as GetContractsForOwnerParams) as any,
        ])
        return alchemyRes
      } catch (ex) {
        throw new GraphQLYogaError(ex as string)
      }
    },
  },

  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext()],
  'Query.contractsForAddress': [setupContext()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
