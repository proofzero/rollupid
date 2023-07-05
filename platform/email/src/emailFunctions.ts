import { InternalServerError } from '@proofzero/errors'
import {
  EmailTemplateBillingReconciledEntitlements,
  EmailTemplateDevReconciledEntitlements,
  EmailTemplateExpiredSubscription,
  EmailTemplateOTP,
  EmailTemplateParams,
} from '../emailTemplate'
import { EmailMessage, EmailNotification } from './types'
import { CloudflareEmailMessage, EmailContent, Environment } from './types'
import { Context } from './context'
import { z } from 'zod'

export const EmailThemePropsSchema = z.object({
  privacyURL: z.string().url(),
  termsURL: z.string().url(),
  contactURL: z.string().url().optional(),
  address: z.string().optional(),
  logoURL: z.string().url().optional(),
  appName: z.string(),
  hostname: z.string().optional(),
})

export type EmailThemeProps = z.infer<typeof EmailThemePropsSchema>

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
      `http://localhost/${otpMatch?.[1] ? 'otp' : 'notification'}/${
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
  throw new InternalServerError({ message: 'Not implemented yet' })
}

const adjustEmailParams = (params?: Partial<EmailTemplateParams>) => {
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

  return params
}

/** OTP email content template with a `code` parameter */
export const getOTPEmailContent = (
  passcode: string,
  params?: Partial<EmailTemplateParams>
): EmailContent => {
  params = adjustEmailParams(params)

  return EmailTemplateOTP(passcode, params as EmailTemplateParams)
}

/** Subscription Cancellation email content template */
export const getSubscriptionEmailContent = (
  params?: Partial<EmailTemplateParams>
): EmailContent => {
  params = adjustEmailParams(params)

  return EmailTemplateExpiredSubscription(params as EmailTemplateParams)
}

export const getBillingReconciliationEmailContent = () =>
  EmailTemplateBillingReconciledEntitlements(
    adjustEmailParams(undefined) as EmailTemplateParams
  )

export const getDevReconciliationEmailContent = () =>
  EmailTemplateDevReconciledEntitlements(
    adjustEmailParams(undefined) as EmailTemplateParams
  )

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

export const getEmailContent = ({
  ctx,
  emailContent,
  name,
  address,
  themeProps,
}: {
  ctx: Context
  emailContent: EmailContent
  name: string
  address: string
  themeProps?: EmailThemeProps
}) => {
  if (
    !(
      ctx.NotificationFromUser &&
      ctx.NotificationFromName &&
      ctx.INTERNAL_DKIM_DOMAIN &&
      ctx.KEY_DKIM_PRIVATEKEY &&
      ctx.INTERNAL_DKIM_SELECTOR
    )
  )
    throw new Error(
      'Environment variables not set correctly to be able to send emails.'
    )

  const env: Environment = {
    NotificationFromUser: ctx.NotificationFromUser,
    NotificationFromName: ctx.NotificationFromName,
    INTERNAL_DKIM_DOMAIN: ctx.INTERNAL_DKIM_DOMAIN,
    KEY_DKIM_PRIVATEKEY: ctx.KEY_DKIM_PRIVATEKEY,
    INTERNAL_DKIM_SELECTOR: ctx.INTERNAL_DKIM_SELECTOR,
    SECRET_TEST_API_TEST_TOKEN: ctx.SECRET_TEST_API_TEST_TOKEN,
    Test: ctx.Test,
  }

  const notification: EmailNotification = {
    content: emailContent,
    recipient: {
      name,
      address,
    },
  }
  let customSender: NotificationSender
  if (themeProps?.hostname) {
    customSender = {
      hostname: themeProps.hostname,
      address: `no-reply@${themeProps.hostname}`,
      name: themeProps.appName,
    }
  }

  return {
    env,
    notification,
    customSender,
  }
}
