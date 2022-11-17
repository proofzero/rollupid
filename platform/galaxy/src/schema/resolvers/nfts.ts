import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { GraphQLYogaError } from "@graphql-yoga/common";

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
      return {
        total: 0,
        next: null,
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