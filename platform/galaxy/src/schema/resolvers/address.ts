import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { GraphQLYogaError } from "@graphql-yoga/common";

import { Resolvers } from "./typedefs";

import OortClient from "./clients/oort";

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

const addressResolvers: Resolvers = {
  Query: {
    address: (
      _parent,
      { address },
      {
        /* oort send, jwt */
      }
    ) => {
      return null;
    },
    addresses: (
      _parent,
      _args,
      {
        /* oort send, jwt */
      }
    ) => {
      return [];
    },
  },
  Mutation: {},
};

const AddressResolverComposition = {
  "Mutation.updateThreeIDAddress": [isAuthorized()],
};

export default composeResolvers(addressResolvers, AddressResolverComposition);
