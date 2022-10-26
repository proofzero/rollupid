import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { GraphQLYogaError } from "@graphql-yoga/common";

import { QueryAddressArgs, MutationUpdateThreeIdAddressArgs } from "./types";
import OortClient from "./clients/oort";

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

const addressResolvers = {
  Query: {
    address: (
      _parent: any,
      { address }: QueryAddressArgs,
      {
        /* oort send, jwt */
      }
    ) => {
      return null;
    },
    addresses: (
      _parent: any,
      _args: any,
      {
        /* oort send, jwt */
      }
    ) => {
      return [];
    },
  },
  Mutation: {
    updateThreeIDAddress: (
      _parent: any,
      { address, visible }: MutationUpdateThreeIdAddressArgs,
      {
        /* oort send, jwt */
      }
    ) => {},
  },
};

const AddressResolverComposition = {
  "Mutation.updateThreeIDAddress": [isAuthorized()],
};

export default composeResolvers(addressResolvers, AddressResolverComposition);
