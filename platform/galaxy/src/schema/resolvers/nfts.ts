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
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      if (!address) buildGQLError(400, `Error: missing required argument 'address'`)

      const alchemyClient: AlchemyClient = new AlchemyClient({
            key: env.ALCHEMY_KEY,
          chain: env.ALCHEMY_CHAIN,
        network: env.ALCHEMY_NETWORK,
      } as AlchemyClientConfig)

      return alchemyClient.getNFTs({
        owner: address,
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
