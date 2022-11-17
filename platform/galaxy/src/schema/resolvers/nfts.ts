import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { GraphQLYogaError } from "@graphql-yoga/common";

import NFTScanClient from './clients/nftscan'

import { Resolvers } from "./typedefs";

import Env from '../../env'

type ResolverContext = {
  env: Env
}

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

const nftsResolver: Resolvers = {
  Query: {
    nftsForAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      const nftScanClient = new NFTScanClient(env.NFT_SCAN_API_KEY)
      const response = await nftScanClient.getTokensForAccount(address)
      // console.log(await response.text())
      return {
        total: 1,
        next: await response.text(),
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