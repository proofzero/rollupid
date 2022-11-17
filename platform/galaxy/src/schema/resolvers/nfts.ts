import { composeResolvers } from "@graphql-tools/resolvers-composition";
// import { GraphQLYogaError } from "@graphql-yoga/common";

import NFTScanClient from './clients/nftscan'

import { Resolvers } from "./typedefs";
import Env from '../../env'

type ResolverContext = {
  env: Env
}

// import {
//   setupContext,
//   isAuthorized,
//   checkHTTPStatus,
//   getRPCResult,
// } from "./utils";

const nftsResolver: Resolvers = {
  Query: {
    nftsForAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      const nftScanClient = new NFTScanClient(env.NFT_SCAN_API_KEY)
      return nftScanClient.getTokensForAccount(address)
    }
  },
  Mutation: {},
};

const NFTsResolverComposition = {
//   "Mutation.updateThreeIDAddress": [isAuthorized()],
};

export default composeResolvers(nftsResolver, NFTsResolverComposition);