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

  const gqlClient = new GraphQLClient("http://127.0.0.1:8787", {
    fetch,
  });

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfileFromAddress({
    address: params.profile,
  });

  // Core wasn't claimed
  // TOOD: This needs to be realigned with funnel
  // if (true) {
  //   let voucher = await getCachedVoucher(params.profile);
  //   if (!voucher) {
  //     voucher = await fetchVoucher({
  //       address: params.profile,
  //       skipImage: !!voucher,
  //     });
  //     voucher = await putCachedVoucher(params.profile, voucher);
  //   }

  //   const prof = profileRes.profile;

  //   await gqlClient.request(
  //     `mutation ($profile: ThreeIDProfileInput, $visibility: Visibility!) {
  //   updateThreeIDProfile(profile: $profile, visibility: $visibility)
  // }`,
  //     {
  //       profile: {
  //         id: address, // TODO: Figure out what's up with ID
  //         displayName: prof?.displayName,
  //         bio: prof?.bio,
  //         job: prof?.job,
  //         location: prof?.location,
  //         website: prof?.website,
  //         avatar: voucher.metadata.image,
  //         cover: voucher.metadata.cover,
  //         isToken: true

  //       },
  //       visibility: Visibility.Public,
  //     },
  //     {
  //       "KBT-Access-JWT-Assertion": jwt,
  //     }
  //   );

  //   return json({
  //     ...{
  //       avatar: voucher.metadata.image,
  //       cover: voucher.metadata.cover,
  //       isToken: false,
  //     },
  //     claimed: false,
  //   });
  // }

  return json({
    ...profileRes.profileFromAddress,
    claimed: true,
  });
};
