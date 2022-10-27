import { composeResolvers } from "@graphql-tools/resolvers-composition";
import Env from "../../env";
import OortClient from "./clients/oort";
import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from "./utils";

import { Resolvers } from "./typedefs";

type ResolverContext = {
  env: Env;
  jwt?: string;
  coreId?: string;
};

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (_parent: any, {}, { env, jwt }: ResolverContext) => {
      const oortClient = new OortClient(env.OORT, jwt);
      const profileResponse = await oortClient.getProfile();
      checkHTTPStatus(profileResponse);
      const res = getRPCResult(profileResponse);
      return await res;
    },
    profileFromAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      const oortClient = new OortClient(env.OORT);
      const profileResponse = await oortClient.getProfileFromAddress(address);
      checkHTTPStatus(profileResponse);
      return await getRPCResult(profileResponse);
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      { profile, visibility = "PRIVATE" },
      { env, jwt, coreId }: ResolverContext
    ) => {
      const oortClient = new OortClient(env.OORT, jwt);
      const profileResponse = await oortClient.getProfile();
      checkHTTPStatus(profileResponse);
      const currentProfile = await getRPCResult(profileResponse);

      console.log("new profile", profile);
      console.log("current profile", currentProfile);
      const newProfile = {
        ...currentProfile,
        ...profile,
      };

      // console.log("newProfile posted to oort", newProfile);

      const updateResponse = await oortClient.updateProfile(
        newProfile,
        visibility
      );
      checkHTTPStatus(updateResponse);
      return !!(await getRPCResult(updateResponse));
    },
  },
  Profile: {
    __resolveType: (obj: any) => {
      if (obj.cover) {
        // TODO: what makes a ThreeIDProfile unique from others?
        return "ThreeIDProfile";
      }
      return "DefaultProfile";
    },
  },
  PFP: {
    __resolveType: (obj: any) => {
      if (obj.isToken) {
        return "NFTPFP";
      }
      return "StandardPFP";
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
