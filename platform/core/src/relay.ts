import PostalMime, { type Address, Email } from 'postal-mime'

import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { EmailAccountType } from '@proofzero/types/account'
import { initAccountNodeByName } from '@proofzero/platform.account/src/nodes'

import type { Environment } from './types'

export interface CloudflareEmailMessage {
  readonly from: string
  readonly to: string
  readonly headers: Headers
  readonly raw: ReadableStream<Uint8Array>
  readonly rawSize: number

  setReject(reason: string): void
  forward(rcptTo: string, headers?: Headers): Promise<void>
}

interface MailChannelAddress {
  name: string
  email: string
}

interface DKIM {
  dkim_domain: string
  dkim_selector: string
  dkim_private_key: string
}

export default async (message: string, env: Environment) => {
  const postalMime = new PostalMime()
  const email = await postalMime.parse(message)

  const dkim: DKIM = {
    dkim_domain: env.INTERNAL_RELAY_DKIM_DOMAIN,
    dkim_selector: env.INTERNAL_RELAY_DKIM_SELECTOR,
    dkim_private_key: env.SECRET_RELAY_DKIM_PRIVATE_KEY,
  }

  const recipients = new Array<Address>()
    .concat(email.to || [])
    .concat(email.cc || [])
    .filter((recipient) =>
      recipient.address.endsWith(`@${env.INTERNAL_RELAY_DKIM_DOMAIN}`)
    )

  for (const recipient of recipients) {
    const nss = generateHashedIDRef(EmailAccountType.Mask, recipient.address)
    const urn = AccountURNSpace.componentizedUrn(nss)
    const node = initAccountNodeByName(urn, env.Account)

    const sourceAccountURN = await node.storage.get<AccountURN>(
      'source-account'
    )
    if (!sourceAccountURN) continue

    const sourceAccountNode = initAccountNodeByName(
      sourceAccountURN,
      env.Account
    )

    const name = (await sourceAccountNode.class.getNickname()) || ''
    const address = await sourceAccountNode.class.getAddress()
    if (!address) continue

    const from: MailChannelAddress = {
      name: email.from.name,
      email: recipient.address,
    }

    const to: MailChannelAddress[] = [
      {
        name,
        email: address,
      },
    ]

    await send(email, from, to, dkim)
  }
}

const send = async (
  email: Email,
  from: MailChannelAddress,
  to: MailChannelAddress[],
  dkim: DKIM
) => {
  const { subject } = email

  const content = []
  if (email.text)
    content.push({
      type: 'text/plain',
      value: email.text,
    })
  if (email.html) {
    content.push({
      type: 'text/html',
      value: email.html,
    })
  }

  const personalizations = [
    {
      to,
      ...dkim,
    },
  ]

  const request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(
      {
        from,
        subject,
        content,
        personalizations,
      },
      null,
      2
    ),
  })

  const response = await fetch(request)
  if (!response.ok) {
    const responseBody = await response.text()
    try {
      console.error(
        'MailChannels',
        JSON.stringify(JSON.parse(responseBody), null, 2)
      )
    } catch (err) {
      console.error('MailChannels', responseBody)
    }
  }
}
