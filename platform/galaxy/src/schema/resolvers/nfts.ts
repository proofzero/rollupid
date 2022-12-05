import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { Resolvers } from './typedefs'
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams,
  GetContractsForOwnerParams,
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
        pageKey,
        pageSize,
        network = 'goerli',
        contractAddresses,
      }: {
        owner: string
        pageKey: string
        pageSize: number
        network: string
        contractAddresses: string[]
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      // console.log('owner', owner)
      // console.log('pageKey', pageKey)
      // console.log('pageSize', pageSize)
      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: JSON.parse(env.ALCHEMY_KEYS)[`${network}`],
        chain:
          network == 'mumbai'
            ? JSON.parse(env.ALCHEMY_CHAINS).polygon
            : JSON.parse(env.ALCHEMY_CHAINS).ethereum,
        network: env.ALCHEMY_NETWORKS[`${network}`],
      } as AlchemyClientConfig)

      // const response = await alchemyClient.getNFTs({
      return alchemyClient
        .getNFTs({
          owner,
          pageKey,
          pageSize,
          contractAddresses,
        } as GetNFTsParams)
        .catch((e) => {
          throw new GraphQLYogaError(e)
        })
      // console.log(response)
      // return response
    },

    contractsForAddress: async (
      _parent: any,
      {
        owner,
        pageKey,
        pageSize,
        network = 'goerli',
      }: {
        owner: string
        pageKey: string
        pageSize: number
        network: string
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: JSON.parse(env.ALCHEMY_KEYS)[`${network}`],
        chain:
          network == 'mumbai'
            ? JSON.parse(env.ALCHEMY_CHAINS).polygon
            : JSON.parse(env.ALCHEMY_CHAINS).ethereum,
        network: env.ALCHEMY_NETWORKS[`${network}`],
      } as AlchemyClientConfig)

      return alchemyClient
        .getContractsForOwner({
          owner,
          pageKey,
          pageSize,
        } as GetNFTsParams)
        .catch((e) => {
          throw new GraphQLYogaError(e)
        })
    },
  },
  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
