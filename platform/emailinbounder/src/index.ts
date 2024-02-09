import { CloudflareEmailMessage } from '@proofzero/packages/types/email'
import type { Environment } from './types'
import createCoreClient from '@proofzero/platform-clients/core'

import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'
import PostalMime, { type Address, Email } from 'postal-mime'

export default {
  async email(message: CloudflareEmailMessage, env: Environment) {
    const decoder = new TextDecoder()
    const reader = message.raw.getReader()

    let content = ''
    let { done, value } = await reader.read()
    while (!done) {
      content += decoder.decode(value)
      ;({ done, value } = await reader.read())
    }

    return relay(content, env)
  },
}

const getCoreClient = (env: Environment) => {
  //New trace as entrypoint is the email trigger and not an HTTP request
  const headers = generateTraceContextHeaders(generateTraceSpan())

  return createCoreClient(env.Core, headers)
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

const relay = async (message: string, env: Environment) => {
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
      recipient.address.endsWith(
        `.${env.INTERNAL_EMAIL_DISTRIBUTION_KEY}@${env.INTERNAL_RELAY_DKIM_DOMAIN}`
      )
    )

  for (const recipient of recipients) {
    const coreClient = getCoreClient(env)
    const { sourceEmail, nickname } =
      await coreClient.account.getSourceFromMaskedAddress.query({
        maskedEmail: recipient.address,
      })
    if (!sourceEmail) continue

    const from: MailChannelAddress = {
      name: `Rollup Hidden email from ${email.from.name}`,
      email: recipient.address,
    }

    const replyTo: MailChannelAddress = {
      name: email.from.name,
      email: email.from.address,
    }

    const to: MailChannelAddress[] = [
      {
        name: nickname,
        email: sourceEmail,
      },
    ]
    await send(email, from, to, replyTo, dkim)
  }
}

const send = async (
  email: Email,
  from: MailChannelAddress,
  to: MailChannelAddress[],
  replyTo: MailChannelAddress,
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
        reply_to: replyTo,
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
