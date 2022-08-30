import { 
    json, redirect,
} from "@remix-run/cloudflare";

import { useEffect } from "react";
import { useNavigate, useLoaderData, useSubmit } from "@remix-run/react";

import { 
    useAccount,
    useSignMessage,
    useDisconnect
 } from 'wagmi'

 import { oortSend } from "~/utils/rpc.server";
 import { createUserSession, getUserSession } from "~/utils/session.server";

 import BaseButton, { links as buttonLinks } from "~/components/base-button";
 import Spinner from "~/components/spinner";


export const links = () => [
    ...buttonLinks(),
];

// Fetch the nonce for address
// @ts-ignore
export const loader = async ({ request, params }) => {
    const session = await getUserSession(request)
    if (session.has("jwt")) {
        return redirect("/auth/gate/" + params.address)
    }
    // @ts-ignore
    const nonceRes = await oortSend("kb_getNonce", [
            params.address,
            {"3id.profile": ["read", "write"], "3id.app": ["read", "write"]},
        ], params.address)

    return json(nonceRes.result);
};

// verify signature for address
// @ts-ignore
export async function action({ request, params }) {
    let formData = await request.formData();

    const signRes = await oortSend("kb_verifyNonce", [
        formData.get("nonce"),
        formData.get("signature"),
    ], params.address) // TODO remove address param when RPC url is changed

    // on success create a cookie/session for the user
    return createUserSession(signRes.result, "/account", params.address);
}

export default function AuthSign() {
    const sign = useLoaderData();

    // // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { address, connector, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            submit({signature: data, nonce: sign.nonce}, {method: 'post', action: `/auth/sign/${address}`});

        }
    })

    let navigate = useNavigate();
    let submit = useSubmit();

    useEffect(() => {
        if (!isConnected) {
            navigate("/auth");
        } else if (!isLoading && connector && sign) {
            signMessage(sign)
        }
    }, [connector])
    

    return (
        <div className="justify-center items-center">
            <p className="auth-message">
                Please sign the auth message.
            </p>
            <p className="auth-secondary-message">
                {error 
                    ? error.message
                    :  "It could take a few seconds for the signing message to appear. If the does not appear try clicking on your wallet."
                }
            </p>
            {!error && <Spinner />}
           
            {error && (
                <div className="error-buttons">
                    <BaseButton text={"Try Again"} color={"dark"} onClick={() => signMessage({message: "hello"})} />
                    <BaseButton text={"Disconnect"} color={"light"} onClick={disconnect} />
                </div>
            )}
        </div>
    )
}