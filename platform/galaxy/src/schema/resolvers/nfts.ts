import { composeResolvers } from "@graphql-tools/resolvers-composition"
import { GraphQLYogaError } from "@graphql-yoga/common"

import { Resolvers } from "./typedefs"
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams
} from '../../../../../packages/alchemy-client'

import {
  buildGQLError,
} from './utils'

import {
  setupContext,
//   isAuthorized,
//   checkHTTPStatus,
//   getRPCResult,
} from "./utils";

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
        contractAddresses
      }: {
        owner: string,
        pageKey: string,
        pageSize: number,
        contractAddresses: string[]
      },
      { env }: ResolverContext
    ) => {
      if (!owner) buildGQLError(400, `Error: missing required argument 'owner'`)

      const alchemyClient: AlchemyClient = new AlchemyClient({
            key: env.ALCHEMY_KEY,
          chain: env.ALCHEMY_CHAIN,
        network: env.ALCHEMY_NETWORK,
      } as AlchemyClientConfig)

      return alchemyClient.getNFTs({
        owner,
        pageKey,
        pageSize,
        contractAddresses,
      } as GetNFTsParams).catch(e => {
        throw new GraphQLYogaError(e)
      })
    }
  },
  Mutation: {},
}

const NFTsResolverComposition = {
  "Query.nftsForAddress": [setupContext()],
};

export default composeResolvers(nftsResolvers, NFTsResolverComposition);
