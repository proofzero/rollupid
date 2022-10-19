import { LoaderFunction, json } from "@remix-run/cloudflare";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import { oortSend } from "~/utils/rpc.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  const publicProfileRes = await oortSend("kb_getObject", ["3id.profile", "public_profile"], {
    address: params.profile
  });

  // Core wasn't claimed
  if (publicProfileRes.error) {
    let voucher = await getCachedVoucher(params.profile);
    if (!voucher) {
      voucher = await fetchVoucher({
        address: params.profile,
        skipImage: !!voucher,
      });
      voucher = await putCachedVoucher(params.profile, voucher);
    }

    return json({
      pfp: {
        url: voucher.metadata.image,
        cover: voucher.metadata.cover,
        isToken: false,
      },
      claimed: false,
    });
  }

  const profile = publicProfileRes.result?.value;


  return json({
    ...profile,
    claimed: true,
  });
};
