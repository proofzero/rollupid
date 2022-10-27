import { LoaderFunction, json } from "@remix-run/cloudflare";
import { GraphQLClient } from "graphql-request";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import { getSdk, Visibility } from "~/utils/galaxy.server";
import { getUserSession, requireJWT } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  // @ts-ignore
  const gqlClient = new GraphQLClient(`${GALAXY_SCHEMA}://${GALAXY_HOST}:${GALAXY_PORT}`, {
    fetch,
  });

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfileFromAddress({
    address: params.profile,
  });

  // TODO: Handle unclaimed core

  return json({
    ...profileRes.profileFromAddress,
    claimed: true,
  });
};
