import { LoaderFunction, json } from "@remix-run/cloudflare";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  // @ts-ignore
  const url = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/@${params.profile}/3id/profile`;

  const publicProfile = await fetch(url);

  // Core wasn't claimed
  if (publicProfile.status === 404) {
    let voucher = await getCachedVoucher(params.profile);
    if (!voucher) {
      voucher = await fetchVoucher({
        address: params.profile,
        skipImage: !!voucher,
      });
      voucher = await putCachedVoucher(params.profile, voucher);
    }

    return {
      pfp: {
        url: voucher.metadata.image,
        cover: voucher.metadata.cover,
        isToken: false,
      },
      claimed: false,
    };
  }

  const publicProfileJson = await publicProfile.json();

  if (publicProfileJson.error) {
    throw new Error(publicProfileJson.error);
  }

  return json({
    ...publicProfileJson,
    claimed: true,
  });
};
