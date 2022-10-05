import { useEffect, useState } from 'react'
import {
  Form,
  useNavigate,
  useLoaderData,
  useActionData,
} from '@remix-run/react'

import { json, redirect } from '@remix-run/cloudflare'

import {
  useAccount,
  useConnect,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons'

import Countdown from 'react-countdown'
import Confetti from 'react-confetti'
import { useWindowWidth, useWindowHeight } from '@react-hook/window-size'

import Spinner from '~/components/spinner'
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { abi } from '~/assets/abi.json'

// @ts-ignore
export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const invite = url.searchParams.get('invite')
  const address = url.searchParams.get('address')
  const signature = url.searchParams.get('signature')

  if (!address) {
    throw new Error('No address provided')
  }

  //@ts-ignore
  const proof = await PROOFS.get(address, { type: 'json' })

  if (!proof || signature != proof.signature) {
    return redirect(
      `/proof?address=${address}${invite ? `&invite=${invite}` : ''}`,
    )
  }

  const reservation = await RESERVE.get('reservation', { type: 'json' })
  console.log('reservation', reservation)
  console.log('address', address)
  console.log(reservation && reservation.address != address)
  if (reservation && reservation.address != address) {
    console.log('here')
    return json({ invite, isReserved: true })
  }

  if (!reservation) {
    await RESERVE.put('reservation', JSON.stringify({ address }), {
      expirationTtl: 60 * 5,
    })
  }

  return json({ invite, isReserved: false })
}

// @ts-ignore
export const action = async ({ request }) => {
  const url = new URL(request.url)
  const invite = url.searchParams.get('invite')

  // get tweet url from link
  const form = await request.formData()
  const address = form.get('address')
  const hash = form.get('hash')
}

export default function Redeem() {
  const [err, setError] = useState(null)
  const [voucher, setVoucher] = useState(null)
  const [expired, setExpired] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [noReserve, setNoReserve] = useState(false)
  const [minting, setMinting] = useState(false)
  const [timer, setTimer] = useState(0)

  const { invite, isReserved } = useLoaderData()

  const showMintTimer = async (expiration) => {
    setTimer(new Date(expiration))
    setMinting(true)
  }

  const countdownRender = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      setExpired(true)
      setNoReserve(false)
      return (
        <span
          className="subheading"
          style={{
            margin: '-1em 0 1em 0',
            fontSize: '18px',
            // color: "#6B7280",
          }}
        >
          Invite has expired. Refresh the page to try again.
        </span>
      )
    } else {
      // Render a countdown
      return (
        <span
          className="subheading"
          style={{
            margin: '-1em 0 1em 0',
            fontSize: '18px',
            // color: "#6B7280",
          }}
        >
          Invite is reserved for: {minutes < 10 ? `0${minutes}` : minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}
        </span>
      )
    }
  }

  const reserveTimerRender = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      setNoReserve(false)
    } else {
      // Render a countdown
      return (
        <span
          className="subheading"
          style={{
            margin: '-1em 0 1em 0',
            fontSize: '18px',
            // color: "#6B7280",
          }}
        >
          Minting queue full. Trying again in:{' '}
          {minutes < 10 ? `0${minutes}` : minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}
        </span>
      )
    }
  }

  const writeTxn = function (write) {
    write()
  }

  const { address, isConnected } = useAccount()

  const {
    connect,
    connectors,
    error,
    isLoading,
    pendingConnector,
  } = useConnect()

  if (err) {
    return (
      <div className="row d-flex align-self-center">
        <div className="col-12 mx-auto text-center subheading">
          <FontAwesomeIcon
            style={{
              marginRight: '0.25em',
              color: 'red',
              display: 'inline-block',
            }}
            icon={faCircleXmark}
          />
          <p
            style={{
              display: 'inline-block',
            }}
          >
            Error: {err}
          </p>
          <p style={{ fontSize: '18px' }}>
            Join our{' '}
            <a target="_blank" href={'https://discord.gg/threeid'}>
              Discord
            </a>{' '}
            for support.
          </p>
        </div>
      </div>
    )
  } else if (!isReserved && typeof window !== 'undefined') {
    const invitee = address
    const {
      config,
      error: prepareError,
      isError: isPrepareError,
    } = usePrepareContractWrite({
      addressOrName: window.ENV.INVITE_CONTRACT_ADDRESS,
      contractInterface: abi,
      functionName: 'awardInvite',
      args: [invitee, voucher],
      overrides: {
        gasLimit: 1000000,
      },
    })

    const { data, error, isError, write } = useContractWrite(config)

    const { isLoading, isSuccess } = useWaitForTransaction({
      hash: data?.hash,
    })

    // if (isSuccess) {
    //   fetch(`${process.env.PREACT_APP_API_HOST_LOCAL}/invite/submit/${props.invite}`, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ address: address + "foo", hash: data?.hash }),
    //   })
    //     .then((resp) => {
    //       if (!resp.ok) {
    //         // get error message from body or default to response status
    //         const error = (data && data.message) || resp.status;
    //         return Promise.reject(error);
    //       }
    //     });
    // }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2 className="subheading">
          {isSuccess
            ? 'Congratulations! 🥳'
            : 'You can now mint your invite. 👀'}
        </h2>

        <div
          style={{
            marginTop: '0em',
            marginBottom: '0em',
          }}
        >
          {/* <Card cardUrl={cardUrl} /> */}
        </div>

        {/* <div>Connected to {address}</div>
        <button disabled={!write || isTxnLoading} onClick={() => write()}> */}
        {minting && !isSuccess && (
          <Countdown date={timer} renderer={countdownRender} />
        )}
        {!isSuccess && (
          <button
            style={{
              width: 233,
              backgroundColor:
                !write || isLoading || expired ? '#ccc' : '#1f2937',
            }}
            className="action-button"
            disabled={!write || isLoading || expired}
            onClick={() => writeTxn(write)}
          >
            {isLoading ? 'Minting...' : 'Mint NFT'}
          </button>
        )}

        {isSuccess && (
          <div
            className="text-center"
            style={{
              padding: '2em',
              marginTop: '-2em',
            }}
          >
            <h2 className="subheading">We've successfully minted your NFT!</h2>
            <a
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '20px',
                textDecoration: 'none',
                margin: '1em 0',
              }}
              className="action-button"
              href="https://dapp.threeid.xyz"
            >
              Claim your 3ID!
            </a>
            <div>
              <a
                className="btn col-12 mx-auto"
                style={{
                  fontSize: '1.25em',
                  color: '#4b5563',
                  padding: '0.75em 2.5em',
                  marginBottom: '0.5em',
                  backgroundColor: '#F3F4F6',
                }}
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=Just minted my @threeid_xyz invite! 🚀 https://opensea.io/assets/ethereum/0x92ce069c08e39bca867d45d2bdc4ebe94e28321a/${parseInt(
                  voucher.tokenId,
                )}%C2%A0 %23web3%C2%A0 %23NFT %23DID`}
              >
                <FontAwesomeIcon
                  style={{ color: '#1DA1F2' }}
                  icon={faTwitter}
                />{' '}
                Share on Twitter
              </a>
            </div>
            <div>
              <a
                target="_blank"
                className="col-12 mx-auto btn"
                href="https://opensea.io/collection/3id-invite"
                style={{
                  fontSize: '1.25em',
                  color: '#4b5563',
                  padding: '0.5em 2.5em',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <img style={{ height: '1.25em' }} src="/assets/opensea.svg" />{' '}
                View on OpenSea
              </a>
            </div>
            <div style={{ marginTop: '1em' }}>
              <a href={`https://etherscan.io/tx/${data?.hash}`}>
                View on: Etherscan
              </a>
            </div>
            <Confetti width={useWindowWidth()} height={useWindowHeight()} />
          </div>
        )}
        {(isPrepareError || isError) && (
          <div>Error: {(prepareError || error)?.message}</div>
        )}
      </div>
    )
  } else {
    return (
      <div className="row d-flex align-self-center">
        <div className="col-12 mx-auto text-center">
          <Text size={TextSize.XL2} weight={TextWeight.Regular400}>
            Reserving invite...
          </Text>
          <Spinner />
        </div>
      </div>
    )
  }
}
