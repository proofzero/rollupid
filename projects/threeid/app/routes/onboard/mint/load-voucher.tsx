import { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { GraphQLClient } from "graphql-request";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import { getSdk, Visibility } from "~/utils/galaxy.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getUserSession(request);

  // TODO: remove chain id and redirect to /auth
  if (!session || !session.has("jwt")) {
    return json(null, {
      status: 500,
    });
  }

  const jwt = session.get("jwt");

  const url = new URL(request.url);
  const queryAddress = url.searchParams.get("address");
  const address = queryAddress ?? session.get("address");

  let voucher = await getCachedVoucher(address);

  // @ts-ignore
  const gqlClient = new GraphQLClient(`${GALAXY_SCHEMA}://${GALAXY_HOST}:${GALAXY_PORT}`, {
    fetch,
  });

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfile(undefined, {
    "KBT-Access-JWT-Assertion": jwt,
  });

  let prof = profileRes.profile;

  if (voucher) {
    if (!voucher.minted && prof?.isToken) {
      // If minted update voucher cache
      voucher = await putCachedVoucher(address, {
        ...voucher,
        minted: true,
      });
    }
  } else {
    voucher = await fetchVoucher({ address, skipImage: !!voucher });
    voucher = await putCachedVoucher(address, voucher);
  }

  if (!prof?.avatar) {
    await galaxySdk.updateProfile({
        profile: {
          id: address, // TODO: Figure out what's up with ID
          displayName: prof?.displayName,
          bio: prof?.bio,
          job: prof?.job,
          location: prof?.location,
          website: prof?.website,
          avatar: voucher.metadata.image,
          cover: voucher.metadata.cover,
          isToken: prof?.isToken,
        },
        visibility: Visibility.Public,
      },
      {
        "KBT-Access-JWT-Assertion": jwt,
      }
    );
  }

  return json(voucher);
};
