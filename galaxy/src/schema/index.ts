import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs } from "@graphql-tools/merge";

import types from "./gql";
import { addressResolver, profileResolver } from "./resolvers";

const mergedTypes = mergeTypeDefs(types);

export default makeExecutableSchema({
  typeDefs: mergedTypes,
  resolvers: [addressResolver, profileResolver],
});
