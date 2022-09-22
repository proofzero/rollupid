import { 
    json, redirect,
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
 } from 'wagmi'

 import { oortSend } from "~/utils/rpc.server";
 import { createUserSession, getUserSession } from "~/utils/session.server";

 import BaseButton, { links as buttonLinks } from "~/components/base-button";
 import Spinner from "~/components/spinner";

 import { signMessageTemplate } from "~/utils/constants";


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

    const url = new URL(request.url);
    const nonce = url.searchParams.get("nonce")
    const isTest = url.searchParams.get("isTest")

    if (!nonce) {
        return redirect(`/auth/nonce/${params.address}${isTest ? "?isTest=true": ''}`);
    }

    return json({nonce, isTest});
};

// verify signature for address
// TODO: support application/json response
// @ts-ignore
export async function action({ request, params }) {
    let formData = await request.formData();

    const signRes = await oortSend("kb_verifyNonce", [
        formData.get("nonce"),
        formData.get("signature"),
    ], {address: params.address}) // TODO remove address param when RPC url is changed

    //TODO: handle error
    // if (signRes.error) {
    //     return json({error: signRes.error})
    // }

    // on success create a cookie/session for the user

    return createUserSession(signRes.result, `/onboard/nickname`, params.address);
}

export default function AuthSign() {
    const sign = useLoaderData();
    const err = useActionData()

    const nonceMessage = signMessageTemplate.replace("{{nonce}}", sign.nonce);

    let navigate = useNavigate();
    let submit = useSubmit();


    // // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { address, connector, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            submit({signature: data, nonce: sign.nonce}, {method: 'post', action: `/auth/sign/${address}`});
        },
    })

    useEffect(() => {
        if (!isConnected && !sign.isTest) {
            navigate("/auth");
        } else if (!isLoading && connector && sign.nonce) {
            signMessage({message: nonceMessage})
        }
    }, [connector])

    return (
        <div className="justify-center items-center">
            <p className="auth-message">
                Please sign the auth message.
            </p>
            <p className="auth-secondary-message">
                {error && "Could not get signature from wallet."}
                {err && "Something went wrong. Please try again."}
                {(!error && !err) ? "It could take a few seconds for the signing message to appear. If the does not appear try clicking on your wallet.": ""}
            </p>

            {(!error && !err) ? <Spinner />: null}
           
            {(error || err) ? (
                <div className="error-buttons grid grid-rows-2 lg:grid-cols-2">
                    <BaseButton text={"Try Again"} color={"dark"} onClick={() => signMessage({message: nonceMessage})} />
                    <BaseButton text={"Disconnect"} color={"light"} onClick={disconnect} />
                </div>
            ): null}
        </div>
    )
}