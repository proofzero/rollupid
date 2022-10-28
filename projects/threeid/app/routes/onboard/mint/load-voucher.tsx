import { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { GraphQLClient } from "graphql-request";
import { redirect } from "react-router";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import {
  getSdk,
  ThreeIdProfile,
  Visibility,
  Nftpfp,
} from "~/utils/galaxy.server";
import { getUserSession } from "~/utils/session.server";
import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

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

  const gqlClient = new GraphQLClient(
    // @ts-ignore
    `${GALAXY_SCHEMA}://${GALAXY_HOST}:${GALAXY_PORT}`,
    {
      fetch,
    }
  );

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfile(undefined, {
    "KBT-Access-JWT-Assertion": jwt,
  });
  const prof = profileRes.profile;

  if (voucher) {
    if (!voucher.minted && prof?.pfp?.isToken) {
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

  if (!prof?.pfp) {
    await galaxySdk.updateProfile(
      {
        profile: {
          displayName: prof?.displayName ?? "",
          pfp: {
            image: gatewayFromIpfs(voucher?.metadata?.image),
          },
          cover: gatewayFromIpfs(voucher?.metadata?.cover),
        },
        visibility: Visibility.Public,
      },
      {
        "KBT-Access-JWT-Assertion": jwt,
      }
    );
  }

  if (voucher.minted) {
    return redirect("/onboard/ens");
  }

  return json(voucher);
};
