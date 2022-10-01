import { useEffect, useState } from "react";
import { useNavigate, useLoaderData, useSubmit } from "@remix-run/react";

import { 
    json, redirect,
} from "@remix-run/cloudflare";

import { 
  useAccount,
  useSignMessage,
} from 'wagmi';

import { verifyMessage } from 'ethers/lib/utils'


import Spinner from "~/components/spinner";

// @ts-ignore
export const loader = async ({ request }) => {

    const url = new URL(request.url);
    const invite = url.searchParams.get("invite")

    return json({invite});

}

export const action = async ({ request }) => {
    // Verify signature when sign message succeeds
    // const address = verifyMessage(variables.message, data)
    // recoveredAddress.current = address
}

export default function Proof() {
    const [showVerify, setShowVerify] = useState(false);
    const [tweetStatus, setTweetStatus] = useState('');

    const { invite } = useLoaderData();

    // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }
    
    const { address, isConnected } = useAccount()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            // Show tweet status verification 
            setTweetStatus(`I'm claiming my decentralized identity @threeid_xyz %23decentralizedidentity sig:${data.toString()}`);
        },
    })

    let navigate = useNavigate();

    useEffect(() => {
        if (!isConnected) {
            navigate(`${invite ? `/${invite}` : '/'}`);
        }
    }, [isConnected])


    const handleProof = () => {
        window.open(`https://twitter.com/intent/tweet?text=${tweetStatus}`)
        setShowVerify(true);
    }

    return (
        <div className="connectors justify-center items-center">
            <p className="auth-message">
                Proof
            </p>
            
            <div className='grid grid-rows-1 mt-2'>
                {!tweetStatus && !showVerify ? 
                    <button onClick={() => signMessage({ message: "I own this tweet @threeid_xyz #decentralizedidentity" })}>
                        Sign Proof 
                    </button> 
                :   <button onClick={handleProof}>Tweet Proof</button>}
                {showVerify &&
                    <form>
                        <input type="text" />
                        <button>Validate</button>
                    </form>
                }
            </div>
        </div>
    );
}
