import { LoaderFunction, json } from "@remix-run/cloudflare";
import galaxyClient from "~/helpers/galaxyClient";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  // TODO: double check that this still throws an exception
  // TODO: remove claimed from response?
  try {
    const profileRes = await galaxyClient.getProfileFromAddress({
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
      pfp: {
        image: voucher.metadata.image,
        isToken: false,
      },
      cover: voucher.metadata.cover,
      claimed: false,
    });
  }
};
