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

  // @ts-ignore
  const url = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/3id/profile`;

  const publicProfile = await fetch(url, {
    headers: {
      "X-Kubelt-Core-Address": params.profile
    }
  });

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

  const [description, job, location] = await Promise.all([
    oortSend(
      "kb_getObject",
      ["3id.profile", "description"],
      {
        address: params.profile
      }
    ),
    oortSend(
      "kb_getObject",
      ["3id.profile", "job"],
      {
        address: params.profile
      }
    ),
    oortSend(
      "kb_getObject",
      ["3id.profile", "location"],
      {
        address: params.profile
      }
    ),
  ])

  return json({
    ...profile,
    description: description.result?.value,
    location: location.result?.value,
    job: job.result?.value,
    claimed: true,
  });
};
