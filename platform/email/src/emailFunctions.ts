import { EmailTemplate, EmailTemplateParams } from '../emailOtpTemplate'
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
  //We're running locally or in dev, so we don't send the email but only log it's content to console
  if (env.Test) {
    const otpMatch = message.content.body.match(/id="passcode">(.+)<\/div>/)
    console.info('Code:', otpMatch?.[1])
    await env.Test.fetch(
      `http://localhost/${otpMatch?.[1] ? 'otp' : 'norification'}/${
        message.recipient.address
      }`,
      {
        method: 'POST',
        headers: {
          Authentication: `Bearer ${env.SECRET_TEST_API_TEST_TOKEN}`,
        },
        body: message.content.body,
      }
    ).then((res) => {
      console.debug(
        'Res: ',
        res.status,
        res.statusText,
        message.recipient.address
      )
    })
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
        dkim_domain: message.customHostname ?? env.INTERNAL_DKIM_DOMAIN,
        dkim_selector: env.INTERNAL_DKIM_SELECTOR,
        dkim_private_key: env.KEY_DKIM_PRIVATEKEY,
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

export type NotificationSender =
  | {
      hostname: string
      name: string
      address: string
    }
  | undefined

export async function sendNotification(
  notification: EmailNotification,
  env: Environment,
  customSender?: NotificationSender
) {
  let from: NotificationSender = {
    hostname: env.INTERNAL_DKIM_DOMAIN,
    name: env.NotificationFromName,
    address: `${env.NotificationFromUser}@${env.INTERNAL_DKIM_DOMAIN}`,
  }

  if (customSender) {
    from = {
      hostname: customSender.hostname,
      name: customSender.name,
      address: customSender.address,
    }
  }

  //Uses default sender info
  const message: EmailMessage = {
    ...notification,
    from,
  }

  await send(message, env)
}

async function forward(message: CloudflareEmailMessage, env: Environment) {
  //TODO: Implement for masked email
  throw new Error('Not implemented yet')
}

/** OTP email content template with a `code` parameter */
export const getOTPEmailContent = (
  passcode: string,
  params?: Partial<EmailTemplateParams>
): EmailContent => {
  if (!params) {
    params = {
      address: '777 Bay Street, Suite C208B Toronto, Ontario M5G 2C8 Canada',
      contactURL: 'https://discord.com/invite/rollupid',
      termsURL: 'https://rollup.id/tos',
      privacyURL: 'https://rollup.id/privacy-policy',
    }
  }

  if (!params.logoURL) {
    params.logoURL =
      'https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/70676dfd-2899-4556-81ef-e5f48f5eb900/public'
  }

  return EmailTemplate(passcode, params as EmailTemplateParams)
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
