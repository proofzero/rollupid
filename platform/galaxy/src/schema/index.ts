import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs } from "@graphql-tools/merge";

import types from "./types";
import { addressResolver, profileResolver, nftsResolver } from "./resolvers";

const mergedTypes = mergeTypeDefs(types);

export default makeExecutableSchema({
  typeDefs: mergedTypes,
  resolvers: [addressResolver, profileResolver, nftsResolver],
});
