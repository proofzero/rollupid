import { EmailMessage, EmailNotification } from './types'
import { CloudflareEmailMessage, EmailContent, Environment } from './types'

/** Shape of structure MailChannel API expects */
type MailChannelEmailBody = {
  personalizations: [
    {
      to: [
        {
          email: string
          name: string
        }
      ]
      dkim_domain: string
      dkim_selector: string
      dkim_private_key: string
    }
  ]
  from: {
    email: string
    name: string
  }
  subject: string
  content: [{ type: 'text/plain' | 'text/html'; value: string }]
}

export async function send(
  message: EmailMessage,
  env: Environment
): Promise<void> {
  if (!env.DKIMDomain || env.DKIMDomain === 'localhost.local') {
    //We're running locally, so we don't send the email but only log it's content to console
    console.info('Email:', message)
    return
  }

  const mailChannelBody: MailChannelEmailBody = {
    personalizations: [
      {
        to: [
          {
            email: message.recipient.address,
            name: message.recipient.name,
          },
        ],
        dkim_domain: env.DKIMDomain,
        dkim_selector: env.DKIMSelector,
        dkim_private_key: env.DKIMPrivateKey,
      },
    ],
    from: {
      email: message.from.address,
      name: message.from.name,
    },
    subject: message.content.subject,
    content: [
      {
        type: message.content.contentType,
        value: message.content.body,
      },
    ],
  }

  //This works without any credentials when the request originates from a CF worker
  const sendReq = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(mailChannelBody),
  })

  const res = await fetch(sendReq)
  const { status, statusText } = res
  console.debug('Res: ', status, statusText)
  return
}

export async function sendNotification(
  notification: EmailNotification,
  env: Environment
) {
  //Uses default sender info
  const message: EmailMessage = {
    ...notification,
    from: {
      name: env.DefaultEmailFromName,
      address: env.DefaultEmailFromAddress,
    },
  }
  await send(message, env)
}

async function forward(message: CloudflareEmailMessage, env: Environment) {
  //TODO: Implement for masked email
  throw new Error('Not implemented yet')
}

/** OTP email content template with a `code` parameter */
export const getOTPEmailContent = (passcode: string): EmailContent => {
  return {
    contentType: 'text/plain',
    subject: `Email verification - one-time passcode`,
    body: `Your Rollup.id verification code is ${passcode}`,
  }
}

/** Magic link email content template */
export const getMagicLinkEmailContent = (
  magicLinkUrl: string
): EmailContent => {
  return {
    contentType: 'text/html',
    subject: `Rollup email login link`,
    body: `Your email login link to rollup.id is <a href="${magicLinkUrl}">. For security reasons, this link is only valid for 1 minute.`,
  }
}
