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
        total: 1,
        next: 'yo',
        content: [{
          contract_address: '123',
          contract_name: 'BAYC:3ID',
          contract_token_id: 456,
          token_id: '0x000456',
          erc_type: 'erc721'
        }],
      };
    }
  },
  Mutation: {},
};

const NFTsResolverComposition = {
//   "Mutation.updateThreeIDAddress": [isAuthorized()],
};

export default composeResolvers(nftsResolver, NFTsResolverComposition);