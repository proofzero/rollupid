import { useEffect, useState } from "react";
import { Form, useNavigate, useLoaderData, useSubmit } from "@remix-run/react";

import { 
    json, redirect,
} from "@remix-run/cloudflare";

import { 
  useAccount,
  useSignMessage,
} from 'wagmi';

import { verifyMessage } from 'ethers/lib/utils'

import { Label, TextInput } from "flowbite-react";

import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import Text, {
    TextColor,
    TextSize,
    TextWeight,
} from "~/components/typography/Text";
import Spinner from "~/components/spinner";

// @ts-ignore
export const loader = async ({ request }) => {

    const url = new URL(request.url);
    const invite = url.searchParams.get("invite")

    return json({invite});

}

// @ts-ignore
export const action = async ({ request }) => {
    // get tweet url from link
    const form = await request.formData();
    const address = form.get("address");
    const message = form.get("message");
    const tweetstatus = form.get("tweetstatus");
    const statusId = tweetstatus.substring(tweetstatus.lastIndexOf('/') + 1)

    const tweetsRes = await fetch(`https://api.twitter.com/2/tweets?ids=${statusId}`, {
        method: "GET",
        headers: {
            // @ts-ignore
            "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`,
        }
    })

    const tweets = await tweetsRes.json()
    const tweet = tweets.data[0].text
    const signature = tweet.split(":")[1]

    // Verify signature when sign message succeeds
    const recoveredAddress = verifyMessage(message, signature)

    if (recoveredAddress == address) {
        const url = new URL(request.url);
        const invite = url.searchParams.get("invite")
        return redirect(`/redeem${invite ? `?invite=${invite}` : ''}`)
    }
    return json({ error: "Invalid signature" }, { status: 400 });
}

export default function Proof() {
    const [showVerify, setShowVerify] = useState(false);
    const [tweetStatus, setTweetStatus] = useState('');
    const [tweetId, setTweetId] = useState('');
    const [message, setMessage] = useState('');

    const { invite, error: proofError } = useLoaderData();

    // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }
    
    const { address, isConnected } = useAccount()
    const { data, error, isLoading, signMessage } = useSignMessage({
        onSuccess(data, variables) {
            setMessage(variables.message.toString())
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
            <p className="auth-message mb-4">
                {!showVerify 
                    ? 
                    "Verify your account by signing a message with your wallet."
                    :
                    "Tweet your signed message to verify your identity."
                }
            </p>
            
            <div className='grid grid-rows-1 mt-2'>
                {!tweetStatus && !showVerify ? 
                <>
                    <Button
                        onClick={() => signMessage({ message: "I own this tweet @threeid_xyz #decentralizedidentity" })}
                        size={ButtonSize.L}
                        >
                        Sign Proof 
                    </Button> 
                    {error && <p className="flex flex-1 flex-col justify-center items-center error">{error.message}</p>}
                </>
                : <>  
                    <Button 
                        onClick={handleProof}
                        size={ButtonSize.L}
                        >Tweet Proof
                    </Button>
                    <Form method="post"
                        className="flex flex-1 flex-col justify-center items-center"
                    >
                        <Label htmlFor="tweetstatus">
                            <Text
                            className="mb-1.5"
                            size={TextSize.SM}
                            weight={TextWeight.Medium500}
                            color={TextColor.Gray700}
                            >
                            Enter the tweet status URL
                            </Text>
                        </Label>
                        <TextInput
                            id="tweetstatus"
                            name="tweetstatus"
                            type="text"
                            placeholder="https://twitter.com/username/status/1234567890"
                            autoFocus={true}
                            required={true}
                            onChange={(event) => setTweetId(event.target.value)}
                            value={tweetId}
                        />
                        <TextInput
                            id="message"
                            name="message"
                            type="hidden"
                            required={true}
                            value={message}
                        />
                        <TextInput
                            id="address"
                            name="address"
                            type="hidden"
                            required={true}
                            value={address}
                        />
                        <Button
                            isSubmit={true}
                            size={ButtonSize.L}
                            >
                            Validate
                        </Button>
                    </Form>
                </>}
                {proofError && <p className="error">{proofError}</p>}
            </div>
        </div>
    );
}
