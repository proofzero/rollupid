import { EmailAddressType, NodeType } from '@kubelt/types/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import generateRandomString from '@kubelt/utils/generateRandomString'

export const loader: LoaderFunction = async ({ request, context }) => {
  const qp = new URL(request.url).searchParams
  const address = qp.get('address')
  if (!address) throw new Error('No address included in request')

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(EmailAddressType.Email, address),
    { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
    { alias: address, hidden: 'true' }
  )

  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )
  try {
    const state = await addressClient.generateEmailOTP.mutate({
      address,
    })
    return json({ state })
  } catch (e) {
    console.error('Error generating email OTP', e)
    throw json(`Error generating email OTP: ${e}`, { status: 500 })
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const address = formData.get('address') as string
  if (!address) throw new Error('No address included in request')

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(EmailAddressType.Email, address),
    { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
    { alias: address, hidden: 'true' }
  )
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )

  const sucessfulVerification = await addressClient.verifyEmailOTP.mutate({
    code: formData.get('code') as string,
    state: formData.get('state') as string,
  })

  return json({ sucessfulVerification })
}
