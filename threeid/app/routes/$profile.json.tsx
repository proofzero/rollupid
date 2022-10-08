import { LoaderFunction, json } from "@remix-run/cloudflare";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "~/utils/galaxy.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  const gqlClient = new GraphQLClient("http://127.0.0.1:8787", {
    fetch,
  });

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfileFromAddress({
    address: params.profile,
  });

  return json({
    ...profileRes.profileFromAddress,
    claimed: true,
  });
};
