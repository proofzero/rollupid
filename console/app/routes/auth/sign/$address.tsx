/**
 * app/routes/auth/sign/$address.tsx
 */

import {
    json,
    redirect,
} from "@remix-run/cloudflare";

import { useEffect } from "react";
import { useNavigate,
    useLoaderData,
    useActionData,
    useSubmit
} from "@remix-run/react";

import {
    useAccount,
    useSignMessage,
    useDisconnect
 } from "wagmi";

 import { oortSend } from "~/shared/utilities/rpc.server";
 import { createSession, getSession } from "~/shared/utilities/session.server";

 import BaseButton, { BaseButtonColor } from "~/shared/components/base-button";
 import Spinner from "~/shared/components/spinner";

 import { signMessageTemplate } from "~/constants";

// Loader
// -----------------------------------------------------------------------------

// Fetch the nonce for address
// @ts-ignore
export const loader = async ({ request, params }) => {
  const session = await getSession(request);
  const url = new URL(request.url);
  const nonce = url.searchParams.get("nonce");
  const isTest = url.searchParams.get("isTest");

  if (!nonce) {
    return redirect(`/auth/nonce/${params.address}${isTest ? "?isTest=true": ''}`);
  }

  return json({ nonce, isTest });
};

// Action
// -----------------------------------------------------------------------------

// verify signature for address
// TODO: support application/json response
// @ts-ignore
export async function action({ request, params }) {
  const formData = await request.formData();
  const nonce = formData.get("nonce");
  const signature = formData.get("signature");

  // TODO remove address param when RPC url is changed
  const verifyResult = await oortSend("kb_verifyNonce", [
    nonce,
    signature,
  ], { address: params.address });

  //TODO: handle error
  // if (verifyResult.error) {
  //     return json({error: verifyResult.error})
  // }

  const jwt = verifyResult.result;

  // On success create a cookie/session for the user
  return createSession(jwt, `/dashboard`, params.address);
}

// Component
// -----------------------------------------------------------------------------

export default function AuthSign() {
  const sign = useLoaderData();
  const err = useActionData();

  const nonceMessage = signMessageTemplate.replace("{{nonce}}", sign.nonce);

  let navigate = useNavigate();
  let submit = useSubmit();

  // NOTE: state is all messed if we render this component with SSR
  if (typeof document === "undefined") {
    return null;
  }

  const { address, connector, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data, error, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      submit({ signature: data, nonce: sign.nonce }, { method: 'post', action: `/auth/sign/${address}` });
    },
  });

  useEffect(() => {
    if (!isConnected && !sign.isTest) {
      navigate("/auth");
    } else if (!isLoading && connector && sign.nonce) {
      signMessage({message: nonceMessage});
    }
  }, [connector]);

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <p className="font-normal text-xl">
        Please sign the auth message.
      </p>
      <p className="text-lg text-kubelt-dark p-2">
        {error && "Could not get signature from wallet."}
        {err && "Something went wrong. Please try again."}
        {(!error && !err) ? "It could take a few seconds for the signing message to appear. If the does not appear try clicking on your wallet.": ""}
      </p>

      {(!error && !err) ? <Spinner />: null}

      {(error || err) ? (
        <div className="flex flex-col md:flex-row gap-2">
          <BaseButton text={"Try Again"} color={BaseButtonColor.LIGHT} onClick={() => signMessage({message: nonceMessage})} />
          <BaseButton text={"Disconnect"} color={BaseButtonColor.LIGHT} onClick={disconnect} />
        </div>
      ): null}
    </div>
  );
}
