import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { GraphQLYogaError } from "@graphql-yoga/common";

import NFTScanClient from './clients/nftscan'

import { Resolvers } from "./typedefs";

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

const nftsResolver: Resolvers = {
  Query: {
    nftsForAddress: (
      _parent,
      { address },
      {
        /* oort send, jwt */
      }
    ) => {
      // const nftScanClient = new NFTScanClient()
      // const response = nftScanClient.getTokensForAccount(address)
      // console.log(response)
      return {
        total: 0,
        next: 'yo',
        content: [null]
      };
    }
  },
  Mutation: {},
};

const NFTsResolverComposition = {
//   "Mutation.updateThreeIDAddress": [isAuthorized()],
};

export default composeResolvers(nftsResolver, NFTsResolverComposition);