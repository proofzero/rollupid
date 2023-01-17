import { json, redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import {
  useNavigate,
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import { useEffect, useState } from 'react'
import { getAddressClient } from '~/platform.server'
import { AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { CryptoAddressType } from '@kubelt/types/address'
import { keccak256 } from '@ethersproject/keccak256'

export const signMessageTemplate = `Welcome to 3ID!

Sign this message to accept the 3ID Terms of Service (https://threeid.xyz/tos), no password needed!

This will not trigger a blockchain transaction or cost any gas fees.

{{nonce}}
`

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { address } = params
  const state = Math.random().toString(36).substring(7)
  const idref = IDRefURNSpace(CryptoAddressType.ETH).urn(address as string)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const addressURN = `${AddressURNSpace.urn(
    hash
  )}?+node_type=crypto&addr_type=eth?=alias=${address}`
  const addressClient = getAddressClient(addressURN)
  try {
    const nonce = await addressClient.getNonce.query({
      address: address as string,
      template: signMessageTemplate,
      state,
      redirectUri: PASSPORT_REDIRECT_URL,
      scope: ['admin'],
    })
    return json({ nonce, address, state })
  } catch (e) {
    console.error('Error getting nonce', e)
    throw json(`Error getting nonce: ${e}`, { status: 500 })
  }
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const { address } = params
  const idref = IDRefURNSpace(CryptoAddressType.ETH).urn(address as string)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const addressURN = `${AddressURNSpace.urn(
    hash
  )}?+node_type=crypto&addr_type=eth?=alias=${address}`

  console.log({ addressURN })
  const addressClient = getAddressClient(addressURN)
  const formData = await request.formData()

  // TODO: validate from data
  const { code } = await addressClient.verifyNonce.mutate({
    nonce: formData.get('nonce') as string,
    signature: formData.get('signature') as string,
  })

  // TODO: handle the error case
  const searchParams = new URL(request.url).searchParams
  searchParams.set('node_type', 'crypto')
  searchParams.set('addr_type', 'eth')
  return redirect(
    `/authenticate/${
      params.address
    }/token?${searchParams}&code=${code}&state=${formData.get('state')}`
  )
}

export default function Sign() {
  const [signing, setSigning] = useState(false)
  const navigate = useNavigate()
  const submit = useSubmit()
  const transition = useTransition()
  const { nonce, address, state } = useLoaderData()
  const nonceMessage = signMessageTemplate.replace('{{nonce}}', nonce)

  const {
    // address: connectedAddress,
    connector,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount()
  const { disconnect } = useDisconnect()
  const { data, error, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      submit(
        { signature: data, nonce, state },
        {
          method: 'post',
          action: `/authenticate/${address}/sign/${window.location.search}`,
        }
      )
    },
  })

  const startSigning = () => {
    signMessage({ message: nonceMessage })
    setSigning(true)
  }

  useEffect(() => {
    if (isConnected && connector) {
      startSigning()
    }
  }, [connector])

  useEffect(() => {
    if ((!isConnected && signing) || isDisconnected || isConnecting) {
      navigate(`/authenticate${window.location.search}`)
    }
  }, [isConnected])

  return (
    <div className={'flex flex-col gap-4 h-screen justify-center items-center'}>
      <h1 className={''}>
        {(!signing || !error) &&
          transition.state == 'idle' &&
          'Please sign the verification message...'}
        {transition.state != 'idle' && 'Loading profile...'}
        {error && signing && `${error}`}
      </h1>
      {(!signing || !error) && (
        <svg
          aria-hidden="true"
          className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-400"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      )}
      {error && signing && (
        <div className="flex gap-4">
          <Button
            btnType="secondary-alt"
            onClick={() => {
              disconnect()
            }}
          >
            Go Back
          </Button>
          <Button onClick={startSigning}>Try Again</Button>
        </div>
      )}
    </div>
  )
}
