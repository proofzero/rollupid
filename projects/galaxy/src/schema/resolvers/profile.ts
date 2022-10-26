import { composeResolvers } from "@graphql-tools/resolvers-composition";

import OortClient from "./clients/oort";
import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

type ResolverContext = {
  env?: any;
  jwt?: string;
  coreId?: string;
};

const threeIDResolvers = {
  Query: {
    profile: async (
      _parent: any,
      { id }: { id?: string },
      { env, jwt, coreId }: ResolverContext
    ) => {
      const oortClient = new OortClient(env.OORT, jwt);
      const profileResponse = await oortClient.getProfile();
      checkHTTPStatus(profileResponse);
      return getRPCResult(profileResponse);
    },
    profileFromAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      console.log("address", address);
      console.log("env", env.OORT);
      const oortClient = new OortClient(env.OORT);
      const profileResponse = await oortClient.getProfileFromAddress(address);
      console.log("profileResponse", profileResponse);
      checkHTTPStatus(profileResponse);
      return getRPCResult(profileResponse);
    },
  },
  // TODO: can schema delegation solve this? https://www.the-guild.dev/graphql/tools/docs/schema-delegation
  ThreeIDProfile: {
    addresses: (_parent: any, _args: any, { env, jwt }: ResolverContext) => {
      return {};
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      {
        profile,
        visibility = "PRIVATE",
      }: { profile: any; visibility?: string },
      { env, jwt, coreId }: ResolverContext
    ) => {
      const oortClient = new OortClient(env.OORT, jwt);
      const profileResponse = await oortClient.getProfile();
      checkHTTPStatus(profileResponse);
      const currentProfile = getRPCResult(profileResponse);

      const newProfile = {
        ...currentProfile,
        ...profile,
      };

      const updateResponse = await oortClient.updateProfile(
        newProfile,
        visibility
      );
      checkHTTPStatus(updateResponse);
      return !!getRPCResult(updateResponse);
    },
  },
};

const ThreeIDResolverComposition = {
  "Query.address": [setupContext()],
  "Query.addresses": [setupContext()],
  "Query.profile": [setupContext()],
  "Mutation.updateThreeIDAddress": [setupContext(), isAuthorized()],
  "Query.profileFromAddress": [setupContext()],
  "Mutation.updateThreeIDProfile": [setupContext(), isAuthorized()],
};

export default composeResolvers(threeIDResolvers, ThreeIDResolverComposition);
