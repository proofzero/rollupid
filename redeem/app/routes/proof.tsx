import { useEffect, useState } from 'react'
import {
  Form,
  useNavigate,
  useLoaderData,
  useActionData,
  useTransition,
} from '@remix-run/react'

import { json, redirect } from '@remix-run/cloudflare'

import { useAccount, useSignMessage } from 'wagmi'

import { verifyMessage } from 'ethers/lib/utils'

import { Button, ButtonSize, ButtonType } from '~/components/buttons'
import Spinner from '~/components/spinner'
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

// @ts-ignore
export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const invite = url.searchParams.get('invite')
  const address = url.searchParams.get('address')

  if (!address) {
    throw new Error('No address provided')
  }

  //@ts-ignore
  const proof = await PROOFS.get(address, { type: 'json' })
  if (proof) {
    return redirect(
      `/redeem?address=${address}&signature=${proof.signature}${
        invite ? `&invite=${invite}` : ''
      }`,
    )
  }

  return json({ invite })
}

// @ts-ignore
export const action = async ({ request }) => {
  // get tweet url from link
  const form = await request.formData()
  const address = form.get('address')
  const message = form.get('message')
  const tweetstatus = form.get('tweetstatus')
  const statusId = tweetstatus.substring(tweetstatus.lastIndexOf('/') + 1)

  const tweetsRes = await fetch(
    `https://api.twitter.com/2/tweets?ids=${statusId}`,
    {
      method: 'GET',
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    },
  )

  if (tweetsRes.status != 200) {
    return json(
      { error: `Invalid tweet status: ${tweetsRes.statusText}` },
      { status: tweetsRes.status },
    )
  }
  const tweets = await tweetsRes.json()
  const tweet = tweets.data[0].text
  const signature = tweet.split('sig:')[1]

  // Verify signature when sign message succeeds
  const recoveredAddress = verifyMessage(message, signature)

  if (recoveredAddress == address) {
    // store that the proof has been sucessfully posted to twitter
    // @ts-ignore
    await PROOFS.put(
      address,
      JSON.stringify({ statusId, tweet, signature, message }),
    )

    const url = new URL(request.url)
    const invite = url.searchParams.get('invite')
    return redirect(
      `/redeem?address=${address}&signature=${signature}${
        invite ? `&invite=${invite}` : ''
      }`,
    )
  }
  return json({ error: 'Invalid signature' }, { status: 400 })
}

export default function Proof() {
  const [showVerify, setShowVerify] = useState(false)
  const [tweetStatus, setTweetStatus] = useState('')
  const [tweetId, setTweetId] = useState('')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')

  const { invite } = useLoaderData()
  const proofError = useActionData()
  const tranistion = useTransition()

  // NOTE: state is all messed if we render this component with SSR
  if (typeof document === 'undefined') {
    return null
  }

  const { address, isConnected } = useAccount()
  const { data, error, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      setMessage(variables.message.toString())
      setSignature(data)
      setShowVerify(true)

      // Show tweet status verification
      // setTweetStatus(`I'm claiming my decentralized identity @threeid_xyz https://dapp.threeid.xyz/${address} %23Web3 sig:${data.toString()}`);
      setTweetStatus(
        `I'm claiming my decentralized identity @threeid_xyz https://get.threeid.xyz %23Web3 sig:${data.toString()}`,
      )
    },
  })

  let navigate = useNavigate()

  useEffect(() => {
    if (!isConnected) {
      navigate(`${invite ? `/${invite}` : '/'}`)
    }
  }, [isConnected])

  const handleProof = () => {
    window.open(`https://twitter.com/intent/tweet?text=${tweetStatus}`)
    setShowVerify(true)
  }

  return (
    <div className="mx-auto justify-center items-center text-center">
      <Text size={TextSize.XL4} weight={TextWeight.SemiBold600}>
        {!showVerify ? 'Verify your account' : 'Verify your identity'}
      </Text>
      <Text className="mt-4" size={TextSize.XL} weight={TextWeight.Regular400}>
        {!showVerify
          ? 'Sign this message with your wallet to verify account ownership'
          : 'Verify your identity by tweeting the signed message'}
      </Text>

      <div className="flex flex-1 flex-col mt-2 gap-4 bg-white p-8 text-left break-words">
        {tweetStatus && showVerify && (
          <Text>1. Tweet out the signed message.</Text>
        )}
        <div
          className="min-h-36 p-4 leading-6 text-lg break-words whitespace-pre-wrap max-w-2xl"
          style={{
            backgroundColor: '#F9FAFB',
            color: !showVerify ? '#D1D5DB' : 'inherit',
          }}
        >
          {/* I'm claiming my decentralized identity @threeid_xyz https://dapp.threeid.xyz/{address} #Web3 sig:{signature} */}
          I'm claiming my decentralized identity @threeid_xyz
          https://get.threeid.xyz #Web3 sig:
          {signature}
        </div>
        {!tweetStatus && !showVerify && (
          <div className="absolute left-1/2 top-1/2 translate-y-1/2 -translate-x-1/2">
            {!isLoading ? (
              <Button
                onClick={() =>
                  signMessage({
                    message: "I'm claiming my decentralized identity!",
                  })
                }
                size={ButtonSize.XL}
              >
                Sign Proof
              </Button>
            ) : (
              <Spinner />
            )}
            {error && (
              <p className="justify-center items-center error">
                {error.message}
              </p>
            )}
          </div>
        )}
        {tweetStatus && showVerify && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded"
            onClick={handleProof}
          >
            Click to Tweet
          </button>
        )}
      </div>
      {tweetStatus && showVerify && (
        <div className="grid mt-2 gap-4 bg-white p-8 text-left break-words">
          <Text>2. Enter the tweet URL and click the validate button.</Text>
          <Form
            method="post"
            className="flex flex-1 flex-col justify-center items-center gap-2"
          >
            <input
              id="tweetstatus"
              name="tweetstatus"
              type="text"
              placeholder="https://twitter.com/username/status/1234567890"
              autoFocus={true}
              required={true}
              onChange={(event) => setTweetId(event.target.value)}
              value={tweetId}
              className="w-full py-4 px-2 flex flex-1"
            />
            <input
              id="message"
              name="message"
              type="hidden"
              required={true}
              value={message}
            />
            <input
              id="address"
              name="address"
              type="hidden"
              required={true}
              value={address}
            />
            <button
              className="py-4 px-6 rounded w-full text-white"
              style={{
                backgroundColor: '#1F2937',
              }}
              type="submit"
              disabled={!tweetId}
            >
              {tranistion.state !== 'loading' ? 'Validate' : <Spinner />}
            </button>
            {proofError && <p className="error">{proofError.error}</p>}
          </Form>
        </div>
      )}
    </div>
  )
}
