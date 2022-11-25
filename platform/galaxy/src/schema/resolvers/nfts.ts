import { composeResolvers } from "@graphql-tools/resolvers-composition"
// import { GraphQLYogaError } from "@graphql-yoga/common"

import { Resolvers } from "./typedefs"

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
        console.log('getting nfts for address', address)
        return 'world'
      }
},
  Mutation: {},
}

const NFTsResolverComposition = {
  "Query.nftsForAddress": [setupContext()],
};

export default composeResolvers(nftsResolvers, NFTsResolverComposition);
