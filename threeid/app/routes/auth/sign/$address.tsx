import { LoaderFunction, json, redirect } from "@remix-run/cloudflare";
import { useEffect } from "react";
import { useNavigate, useLoaderData } from "@remix-run/react";

import { 
    useAccount,
    useConnect,
    useSignMessage
 } from 'wagmi'
import { connect } from "http2";

export const loader: LoaderFunction = async ({
    params,
  }) => {
    // TODO: call oort for nonce
    console.log(params);
    return json(params);
    //return json(await getUserPreferences());
  };

// export async function action({ request }) {
//     await updatePreferences(await request.formData());
//     return redirect("/prefs");
//   }

export default function AuthSign() {
    const sign = useLoaderData();
    console.log("nonce", sign);

    // // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { address, connector, isConnected } = useAccount()
    const { connectors, pendingConnector } = useConnect()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            console.log("signed", data);      
            navigate("/welcome");
        },
        onError(error) {
            console.log("error", error);
        }
    })

    let navigate = useNavigate();


    useEffect(() => {
        if (!isConnected) {
            navigate("/auth");
        } else if (!isLoading && connector && sign.address === address) {
            signMessage({message: "hello"})
        }
    }, [connector])
    

    return (
        <div className="justify-center items-center">
             {error && <div>{error.message}</div>}
            <p className="auth-message">
                Please sign the auth message.
            </p>
            <p className="auth-secondary-message">
                It could take a few seconds for the signing message to appear. If the does not appear try clicking on your wallet.
            </p>
        </div>
    )
}