import { json, redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { getAddressClient } from '../../../platform.server'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '../../../session.server'

export const signMessageTemplate = `Welcome to Rollup!

Sign this message to accept the Rollup Terms of Service (https://rollup.id/tos), no password needed!

This will not trigger a blockchain transaction or cost any gas fees.

{{nonce}}
`

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { address } = params
  if (!address) throw new Error('No address included in request')

  const state = Math.random().toString(36).substring(7)
  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, address),
    { node_type: NodeType.Crypto, addr_type: CryptoAddressType.ETH },
    { alias: address }
  )

  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )
  try {
    const nonce = await addressClient.getNonce.query({
      address: address as string,
      template: signMessageTemplate,
      state,
      redirectUri: context.env.PASSPORT_REDIRECT_URL,
      scope: ['admin'],
    })
    return json({ nonce, address, state })
  } catch (e) {
    console.error('Error getting nonce', e)
    throw json(`Error getting nonce: ${e}`, { status: 500 })
  }
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const appData = await getConsoleParams(request, context.env)

  const { address } = params
  if (!address) throw new Error('No address included in request')

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, address),
    { node_type: NodeType.Crypto, addr_type: CryptoAddressType.ETH },
    { alias: address }
  )
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )
  const formData = await request.formData()

  // TODO: validate from data
  const { existing } = await addressClient.verifyNonce.mutate({
    nonce: formData.get('nonce') as string,
    signature: formData.get('signature') as string,
    jwt: await getJWTConditionallyFromSession(
      request,
      context.env,
      appData?.clientId
    ),
    forceAccountCreation: !appData || appData.prompt !== 'login',
  })

  if (appData?.prompt === 'login' && existing) {
    return redirect(`${appData.redirectUri}?error=ALREADY_CONNECTED`)
  }

  // TODO: handle the error case
  const searchParams = new URL(request.url).searchParams
  searchParams.set('node_type', 'crypto')
  searchParams.set('addr_type', 'eth')
  const state = formData.get('state')
  if (state) {
    searchParams.set('state', state as string)
  }

  return redirect(`/connect/${params.address}/token?${searchParams}`)
}
