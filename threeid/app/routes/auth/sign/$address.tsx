import { 
    LoaderFunction,
    json,
    redirect 
} from "@remix-run/cloudflare";

import { useEffect } from "react";
import { useNavigate, useLoaderData, useSubmit } from "@remix-run/react";

import { 
    useAccount,
    useConnect,
    useSignMessage,
    useDisconnect
 } from 'wagmi'

 import BaseButton, { links as buttonLinks } from "~/components/BaseButton";

 export const links = () => [
    ...buttonLinks(),
];


// Fetch the nonce for address
export const loader: LoaderFunction = async ({
    params,
  }) => {
    // TODO: call oort for nonce
    console.log(params);
    return json(params);
    //return json(await getUserPreferences());
  };

// verify signature for address
export async function action({ request, params }) {
    let formData = await request.formData();
    console.log("formData", formData);
    console.log("params", params);
    return redirect("/welcome");
  }

export default function AuthSign() {
    const sign = useLoaderData();
    console.log("nonce", sign);

    // // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { address, connector, isConnected } = useAccount()
    const { connectors, pendingConnector } = useConnect()
    const { disconnect } = useDisconnect()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            console.log("signed", data);      
            submit({signature: data}, {method: 'post', action: `/auth/sign/${sign.address}`});

        },
        onError(error) {
            console.log("error", error);
        }
    })

    let navigate = useNavigate();
    let submit = useSubmit();

    useEffect(() => {
        if (!isConnected) {
            navigate("/auth");
        } else if (!isLoading && connector && sign.address === address) {
            signMessage({message: "hello"})
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
            {error && (
                <div className="error-buttons">
                    <BaseButton text={"Try Again"} color={"dark"} onClick={() => signMessage({message: "hello"})} />
                    <BaseButton text={"Disconnect"} color={"light"} onClick={disconnect} />
                </div>
            )}
        </div>
    )
}