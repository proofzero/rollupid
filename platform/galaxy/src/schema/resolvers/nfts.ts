import { composeResolvers } from "@graphql-tools/resolvers-composition"
import { GraphQLYogaError } from "@graphql-yoga/common"

import { Resolvers } from "./typedefs"
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams
} from './clients/alchemy'

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

      let nfts = await alchemyClient.getNFTs({
        owner: address,
      } as GetNFTsParams)

      const response = 

      console.log(nfts.ownedNfts[0])

      return {
        test: 'test',
        ownedNfts: [{
          contract: {
            address: nfts.ownedNfts[0].contract.address,
          }
        }],
        totalCount: nfts.totalCount,
        pageKey: nfts.pageKey,
        blockHash: nfts.blockHash,
      }
    }
  },
  Mutation: {},
}

const NFTsResolverComposition = {
  "Query.nftsForAddress": [setupContext()],
};

export default composeResolvers(nftsResolvers, NFTsResolverComposition);
