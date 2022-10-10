import { useEffect, useState } from 'react'
import { useLoaderData, useSubmit, useTransition } from '@remix-run/react'

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

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import Spinner from '~/components/spinner'

import { abi } from '~/assets/abi.json'

// @ts-ignore
export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const invite = url.searchParams.get('invite')
  const address = url.searchParams.get('address')
  const signature = url.searchParams.get('signature')

  if (!address) {
    throw json("No address provided", {status: 400})
  }

  // check if address already has an invite
  const holderRes = await fetch(
    // @ts-ignore
    `${ALCHEMY_NFT_URL}/isHolderOfCollection?wallet=${address}&contractAddress=${INVITE_CONTRACT_ADDRESS}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
    },
  )

  if (holderRes.status !== 200) {
    throw json("Error checking if address is holder of collection'", {status: 500})
  }
  const holderJson = await holderRes.json()
  if (holderJson.isHolderOfCollection) {
    throw json("Address ${address} already has an invite code, can't redeem another", {status: 409})
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
    return redirect(
      `/queue?address=${address}&signature=${signature}${
        invite ? `&invite=${invite}` : ''
      }`,
    )
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

export default function Redeem() {
  const {
    address: invitee,
    invite,
    voucher,
    embed,
    expiration,
  } = useLoaderData()
  const submit = useSubmit()
  const transition = useTransition()

  const [expired, setExpired] = useState(false)

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { pendingChainId, switchNetwork } = useSwitchNetwork()
  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    //@ts-ignore
    addressOrName:
      typeof window !== 'undefined' && window.ENV.INVITE_CONTRACT_ADDRESS,
    contractInterface: abi,
    functionName: 'awardInvite',
    args: [invitee, voucher],
    overrides: {
      gasLimit: 1000000,
    },
  })
  const { data, error, isError, write } = useContractWrite({
    ...config,
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
  }, [pendingChainId, switchNetwork])

  useEffect(() => {
    if (data?.hash) {
      submit(
        {
          address: invitee,
          hash: data.hash,
          invite,
          voucher: JSON.stringify(voucher),
          embed: JSON.stringify(embed),
        },
        { method: 'post', action: '/success' },
      )
    }
  }, [isSuccess])

  // @ts-ignore
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
          ? 'Invite has expired. Refresh the page to try again.'
          : `Invite is reserved for: ${
              minutes < 10 ? `0${minutes}` : minutes
            }:${seconds < 10 ? `0${seconds}` : seconds}`}
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
      <Text
        className="text-center"
        size={TextSize.XL3}
        weight={TextWeight.SemiBold600}
      >
        You can now mint your invite. 👀
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

      <Countdown date={expiration} renderer={countdownRender} />

      {!isConnected && (
        <Text size={TextSize.SM} className="text-center mb-2">
          Wallet not connected.
          <br />
          Please unlock wallet and refresh page.
        </Text>
      )}
      <button
        className="py-4 px-6 text-white"
        style={{
          width: 233,
          backgroundColor:
            !isConnected || !write || isPrepareError || isLoading || expired
              ? '#ccc'
              : '#1f2937',
        }}
        disabled={
          !isConnected || !write || isPrepareError || isLoading || expired
        }
        onClick={write}
      >
        {isLoading ? 'Minting...' : 'Mint NFT'}
      </button>
      {transition.state === 'loading' ?? <Spinner />}
      {(isPrepareError || isError) && (
        <div>Error: {(prepareError || error)?.message}</div>
      )}
    </div>
  )
}
