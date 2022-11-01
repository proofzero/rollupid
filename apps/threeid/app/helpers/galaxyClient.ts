import { GraphQLClient } from "graphql-request";
import { getSdk } from "~/utils/galaxy.server";

const serviceBindingFetchWrapper = function (
  input: RequestInfo,
  init?: RequestInit
) {
  // @ ts-ignore
  return GALAXY.fetch(input, init);
};

const gqlClient = new GraphQLClient("http://127.0.0.1", {
  fetch: serviceBindingFetchWrapper,
});

export default getSdk(gqlClient);
