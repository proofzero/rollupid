import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { JsonError } from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    const qp = new URL(request.url).searchParams

    const email = qp.get('email')
    if (!email) throw new Error('No address included in request')

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(EmailAddressType.Email, email),
      { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
      { alias: email, hidden: 'true' }
    )

    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    const state = await addressClient.generateEmailOTP.mutate({
      email,
    })
    return json({ state })
  } catch (e) {
    console.error('Error generating email OTP', e)
    throw JsonError(e)
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  if (!email) throw new Error('No email address included in request')

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(EmailAddressType.Email, email),
    { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
    { alias: email, hidden: 'true' }
  )
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )

  const successfulVerification = await addressClient.verifyEmailOTP.mutate({
    code: formData.get('code') as string,
    state: formData.get('state') as string,
  })

  return json({ addressURN, successfulVerification })
}
