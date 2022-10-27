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

  try {
    const profileRes = await galaxySdk.getProfileFromAddress({
      address: params.profile,
    });

    return json({
      ...profileRes.profileFromAddress,
      claimed: true,
    });
  } catch (e) {
    let voucher = await getCachedVoucher(params.profile);
    if (!voucher) {
      voucher = await fetchVoucher({
        address: params.profile,
        skipImage: !!voucher,
      });
      voucher = await putCachedVoucher(params.profile, voucher);
    }

    return json({
      avatar: voucher.metadata.image,
      cover: voucher.metadata.cover,
      isToken: false,
      claimed: false,
    });
  }
};
