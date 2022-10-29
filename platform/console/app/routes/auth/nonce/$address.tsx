/**
 * @file app/routes/auth/nonce/$address.tsx
 */

import {
  redirect,
} from "@remix-run/cloudflare";

 import { oortSend } from "~/shared/utilities/rpc.server";
 import { signMessageTemplate } from "~/constants";

// Loader
// -----------------------------------------------------------------------------

// Fetch the nonce for address
// TODO: support application/json response
// @ts-ignore
export const loader = async ({ request, params }) => {
  const url = new URL(request.url);
  const isTest = url.searchParams.get("isTest");

  // TODO: add support for { "blockchain": "ethereum", "chain": "goerli", "chainId": 5 } in JWT
  const claims = {
    "starbase.storage": [
      "read",
      "write",
    ],
  };

  // @ts-ignore
  const getNonce = await oortSend("kb_getNonce", [
    params.address,
    signMessageTemplate,
    claims,
  ], {address: params.address});

  // TODO check result, redirect to 500 page if necessary

  const queryParams = new URLSearchParams({
    nonce: getNonce?.result?.nonce,
    isTest: isTest ? true : undefined,
  });
  const target = `/auth/sign/${params.address}?${queryParams.toString()}`;

  return redirect(target);
};
