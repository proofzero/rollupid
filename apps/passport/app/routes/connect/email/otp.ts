import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { authenticateAddress } from '~/utils/authenticate.server'

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

  if (sucessfulVerification) {
    const appData = await getConsoleParamsSession(request, context.env)
      .then((session) => JSON.parse(session.get('params')))
      .catch(() => null)

    const { accountURN, existing } = await addressClient.resolveAccount.query({
      jwt: await getJWTConditionallyFromSession(
        request,
        context.env,
        appData?.clientId
      ),
      force: !appData || appData.prompt !== 'login',
    })

    return authenticateAddress(
      addressURN,
      accountURN,
      appData,
      context.env,
      context.traceSpan,
      existing
    )
  }

  return json({ sucessfulVerification })
}
