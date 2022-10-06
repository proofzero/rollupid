import { useEffect, useState } from 'react'
import {
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import { keccak256 } from '@ethersproject/solidity'
import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { arrayify, hexlify } from '@ethersproject/bytes'

import { json, redirect } from '@remix-run/cloudflare'

import {
  useAccount,
  useSwitchNetwork,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import Countdown from 'react-countdown'
import Confetti from 'react-confetti'
import { useWindowWidth, useWindowHeight } from '@react-hook/window-size'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons'

import Spinner from '~/components/spinner'
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { abi } from '~/assets/abi.json'
import openSeaLogo from "~/assets/opensea.svg"

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

  // @ts-ignore
  const reservation = await RESERVE.get('reservation', { type: 'json' })

  // The reservation exists and it belongs to this address
  if (reservation && reservation.address == address) {
    const { data, expiration } = reservation
    return json({ address, invite, expiration, ...data })
  }

  // The reservation exists and it belongs to someone else make them wait
  if (reservation && reservation.address != address) {
    return redirect(`/queue?address=${address}&signature=${signature}${invite ? `&invite=${invite}` : ''}`)
  }

  // No reservation so let's lock one in
  // next steps are slow so let's set an optimistic reservation
  // @ts-ignore
  await RESERVE.put('reservation', JSON.stringify({ address }), {
    expirationTtl: 60 * 5,
  })

  try {
    // ask the contract for the next invite id
    // @ts-ignore
    const tokenIdRes = await fetch(`${ALCHEMY_API_URL}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            // @ts-ignore
            to: INVITE_CONTRACT_ADDRESS,
            data: '0xff37c2bc',
          },
        ],
      }),
    })
    if (tokenIdRes.status != 200) {
      throw new Error('Error reaching blockchain node')
    }
    const tokenId = BigNumber.from((await tokenIdRes.json()).result).toNumber()

    // ask nftar to generate the metadata and assets
    // @ts-ignore
    const nftarRes = await fetch(NFTAR_URL, {
      method: 'POST',
      headers: {
        // @ts-ignore
        authorization: `${NFTAR_AUTHORIZATION}`,
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: '3id_genInvite',
        params: {
          recipient: address,
          inviteId: tokenId.toString(),
          inviteTier: 'Gen Zero',
          issueDate: Intl.DateTimeFormat('en-GB-u-ca-iso8601').format(
            Date.now(),
          ),
        },
      }),
    })

    if (nftarRes.status != 200) {
      throw new Error('Error reaching invite generator')
    }
    const nftar = await nftarRes.json()
    if (nftar.error) {
      throw new Error(`Failed to generate invite: ${nftar.error.message}`)
    }

    // generate the voucher
    const { embed, metadata, url: uri } = nftar.result
    const hash = keccak256(
      ['address', 'string', 'uint'],
      [address, uri, tokenId],
    )
    // @ts-ignore
    const operator = new Wallet(INVITE_OPERATOR_PRIVATE_KEY)
    const signature = await operator.signMessage(arrayify(hash))
    const voucher = { recipient: address, uri, tokenId, signature }
    const expiration = Date.now() + 60 * 5 * 1000

    const data = { embed, metadata, voucher, expiration }

    //update the reservation
    // @ts-ignore
    await RESERVE.put(
      'reservation',
      JSON.stringify({ address, expiration, data }),
      {
        expirationTtl: 60 * 5,
      },
    )

    return json({ address, invite, voucher, embed, expiration })
  } catch (e) {
    // delete the optimistic reservation
    // @ts-ignore
    await RESERVE.delete('reservation')
    throw Error("Couldn't reserve invite")
  }
}

// @ts-ignore
export const action = async ({ request }) => {
  // get tweet url from link
  const form = await request.formData()
  const address = form.get('address')
  const hash = form.get('hash')
  const invite = form.get('invite')

  console.log('form', form, {address, hash, invite})
  
  //@ts-ignore
  await RESERVE.delete('reservation')


  // @ts-ignore
  const inviteRecord = await INVITES.get(invite, { type: 'json' })
  if (!inviteRecord) {
    // fake invite so skip
    return null
  }


  return null
}

export default function Redeem() {
  const { address: invitee, invite, voucher, embed, expiration } = useLoaderData()
  const submit = useSubmit();

  const [expired, setExpired] = useState(false)
  const [useWindowWidthState, setUseWindowWidthState] = useState(useWindowWidth())
  const [useWindowHeightState, setUseWindowHeightState] = useState(useWindowHeight())

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { pendingChainId, switchNetwork } =  useSwitchNetwork()
  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    //@ts-ignore
    addressOrName: typeof window !== 'undefined' && window.ENV.INVITE_CONTRACT_ADDRESS,
    contractInterface: abi,
    functionName: 'awardInvite',
    args: [invitee, voucher],
    overrides: {
      gasLimit: 1000000,
    }
  })
  const { data, error, isError, write } = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("isSuccess 2", isSuccess)
      submit({
        address: invitee,
        hash: data.hash,
        invite,
      }, {method: "post"})
    }
  })
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    //@ts-ignore
    if (switchNetwork && chain?.id != window.ENV.CHAIN_ID) {
      //@ts-ignore
      switchNetwork(`0x${window.ENV.CHAIN_ID}`)
    }
  }, [pendingChainId])

  // useEffect(() => {
  //   console.log("isSuccess 2", isSuccess)
  //   if (data?.hash) {
  //     submit({
  //       address: invitee,
  //       hash: data.hash,
  //       invite,
  //     }, {method: "post"})
  //   }
  // }, [isSuccess])

  const countdownRender = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      setExpired(true)
    }
    return (
      <Text
        className="mb-4 text-center"
        size={TextSize.LG}
        weight={TextWeight.Regular400}
      >
        {completed
        ?
          "Invite has expired. Refresh the page to try again."
        :
          `Invite is reserved for: ${minutes < 10 ? `0${minutes}` : minutes}:
          ${seconds < 10 ? `0${seconds}` : seconds}`
        }
      </Text>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text className="text-center" size={TextSize.XL3} weight={TextWeight.SemiBold600}>
        {isSuccess
          ? 'Congratulations! 🥳'
          : 'You can now mint your invite. 👀'}
      </Text>

      <div
        style={{
          marginTop: '-2em',
          marginBottom: '0em',
          minHeight: 358,
        }}
      >
        <div className="mx-auto text-center">
          <img
            className="w-full"
            style={{ maxWidth: '28em' }}
            src={embed.image}
          />
        </div>
      </div>

      {!isSuccess && (
        <>
          <Countdown date={expiration} renderer={countdownRender} />

          {!isConnected &&
            <Text size={TextSize.SM} className="text-center mb-2">
              Wallet not connected.<br/>Please unlock wallet and refresh page.
            </Text>
          }
          <button
            className="py-4 px-6 text-white"
            style={{
              width: 233,
              backgroundColor: !isConnected || !write || isPrepareError || isLoading || expired ? '#ccc' : '#1f2937',
            }}
            disabled={!isConnected || !write || isPrepareError || isLoading || expired}
            onClick={write}
          >
            {isLoading ? 'Minting...' : 'Mint NFT'}
          </button>
          {(isPrepareError || isError) && (
            <div>Error: {(prepareError || error)?.message}</div>
          )}
        </>
      )}

      {isSuccess && (
        <div
          className="text-center"
          style={{
            padding: '2em',
            marginTop: '-2em',
          }}
        >
          <Text className="text-center" size={TextSize.XL} weight={TextWeight.Regular400}>
            We've successfully minted your invite.
          </Text>            
          <a
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '0.75em 2.5em',
              textDecoration: 'none',
              fontSize: '1.25em',
              marginBottom: "0.5em"
            }}
            className="action-button"
            href="https://dapp.threeid.xyz"
          >
            Claim your 3ID!
          </a>
          <div>
            <a
              className="action-button col-12 mx-auto"
              style={{
                fontSize: '1.25em',
                color: '#4b5563',
                padding: '0.75em 2.5em',
                marginBottom: '0.5em',
                backgroundColor: '#F3F4F6',
              }}
              target="_blank"
              href={`https://twitter.com/intent/tweet?text=Just minted my @threeid_xyz invite! 🚀 https://opensea.io/assets/ethereum/0x92ce069c08e39bca867d45d2bdc4ebe94e28321a/${parseInt(
                voucher?.tokenId,
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
              className="col-12 mx-auto action-button"
              href="https://opensea.io/collection/3id-invite"
              style={{
                fontSize: '1.25em',
                color: '#4b5563',
                padding: '0.75em 2.5em',
                backgroundColor: '#F3F4F6',
              }}
            >
              <img style={{ height: '1.25em' }} src={openSeaLogo} />{' '}
              View on OpenSea
            </a>
          </div>
          <div style={{ marginTop: '1em' }}>
            <a href={`https://etherscan.io/tx/${data?.hash}`} style={{textDecoration: "underline"}}>
              View on: Etherscan
            </a>
          </div>
          <Confetti width={useWindowWidthState} height={useWindowHeightState} />
        </div>
      )}
    </div>
  )

}

