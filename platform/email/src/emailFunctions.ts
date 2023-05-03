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
    console.info('Email:', message)
    await env.Test.fetch(`http://localhost/otp/${message.recipient.address}`, {
      method: 'POST',
      headers: {
        Authentication: `Bearer ${env.SECRET_TEST_API_TEST_TOKEN}`,
      },
      body: message.content.body,
    }).then((res) => {
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
        dkim_domain: env.INTERNAL_DKIM_DOMAIN,
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

export async function sendNotification(
  notification: EmailNotification,
  env: Environment
) {
  //Uses default sender info
  const message: EmailMessage = {
    ...notification,
    from: {
      name: env.NotificationFromName,
      address: `${env.NotificationFromUser}@${env.INTERNAL_DKIM_DOMAIN}`,
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
    body: `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;500&display=swap" rel="stylesheet">
    <div style="width:100%;display:flex;align-items: center; justify-content: center;">
    <div
    style="display:flex;
    flex-direction:column;
    align-items:start;
    justify-content:start;
    width:375px;
    border:1px solid #E5E7EB;
    border-radius:8px;
    padding:40px 24px;"
  >
    <img
      style="width:170px;
       padding-bottom:37px;"
      src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/0609d5b5-fa07-4947-d560-a5993d067500/public"
      alt="rollup logo"
    />
    <div
      style="font-size:36px;
        font-weight:600;
        line-height:44px;
        padding-bottom:16px;
        letter-spacing:-0.05em;
        font-family:Inter;
        font-style:normal;"
    >
      Confirm Your Email Address
    </div>
    <p
      style="font-size:16px;
        font-weight:500;
        line-height:24px;
        color:#6B7280;
        letter-spacing:-0.02em;
        font-family:Inter;
        font-style:normal;"
    >
      Please copy and paste the 6-digit code below into the number fields of your
      verification process.
    </p>
    <div
      style="background-color:#F3F4F6;
        width:100%;
        text-align:center;
        font-size:46px;
        font-weight:600;
        border-radius:8px;
        margin-top:20px;
        margin-bottom:20px;
        padding-top:15px;
        padding-bottom:15px;"
      id="passcode">${passcode}</div>
    <p
      style="font-size:16px;
        font-weight:500;
        line-height:24px;
        color:#6B7280;
        letter-spacing:-0.02em;
        font-family:Inter;
        font-style:normal;"
    >
      Please note: the code will be valid for the next 10 minutes.
    </p>
    <p
      style="font-size:16px;
        font-weight:500;
        line-height:24px;
        color:#6B7280;
        letter-spacing:-0.02em;
        font-family:Inter;
        padding-bottom:24px;
        font-style:normal;"
    >
      If you didn&apos;t request this email, there&apos;s nothing to worry about -
      you can safely ignore it.
    </p>
    <div
      style="border-bottom:1px solid black;
      width:100%;
      border-color:#E5E7EB;"
    ></div>
    <div
      style="margin-top:20px;
      width:100%;
      display:flex;
      flex-direction:row;
      padding-bottom:24px;"
    >
      <div style="margin-right:5%;">
        <a
          style="font-size:12px;
          font-weight:500;
          line-height:12px;
          color:#6B7280;
          letter-spacing:-0.02em;
          font-family:Inter;
          font-style:normal;
          border-bottom:1px solid black;
          border-color:#6B7280;"
          href="https://rollup.id/tos"
          target="_blank"
          rel="noreferrer"
        >
          Terms & conditions
        </a>
      </div>
      <div
        style="border-left:1px solid black;
        padding-left:5%;
        padding-right:5%;
        border-color:#6B7280;"
      >
        <a
          style="font-size:12px;
          font-weight:500;
          line-height:12px;
          color:#6B7280;
          letter-spacing:-0.02em;
          font-family:Inter;
          font-style:normal;
          border-bottom:1px solid black;
          border-color:#6B7280;"
          href="https://rollup.id/privacy-policy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy policy
        </a>
      </div>
      <div
        style="border-left:1px solid black;
        padding-left:5%;
        border-color:#6B7280;"
      >
        <a
          style="font-size:12px;
          font-weight:500;
          line-height:12px;
          color:#6B7280;
          letter-spacing:-0.02em;
          font-family:Inter;
          font-style:normal;
          border-bottom:1px solid black;
          border-color:#6B7280;"
          href="https://discord.com/invite/rollupid"
          target="_blank"
          rel="noreferrer"
        >
          Contact us
        </a>
      </div>
    </div>
    <p
      style="font-size:12px;
      font-weight:500;
      line-height:16px;
      color:#6B7280;
      letter-spacing:-0.02em;
      font-family:Inter;
      font-style:normal;
      padding-bottom:4px;"
    >
      Proof Zero Inc, 4 Collier Street, 2nd Floor, Toronto,
      ON M4W 2G9, Canada
    </p>
    <p
      style="font-size:12px;
      font-weight:500;
      line-height:20px;
      color:#6B7280;
      letter-spacing:-0.02em;
      font-family:Inter;
      font-style:normal;
      padding-bottom:20px;"
    >
      All rights reserved.
    </p>

    <div
      style="display:flex;
      flex-direction:row;
      gap:5px;"
    >
      <img
        src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/ee4205c5-eccb-4b28-d4c6-6a3e5fe39100/public"
        alt="rollup logo"
        style="width:14px;height:14px;"
      />
      <p
        style="font-size:12px;
        font-weight:500;
        line-height:12px;
        color:#6B7280;
        letter-spacing:-0.02em;
        font-family:Inter;
        font-style:normal;
        margin-top:auto;
        color:#9CA3AF"
      >
        Powered by <a href="https://rollup.id" target="_blank" rel="noreferrer"
        style="color:#9CA3AF">rollup.id</a>
      </p>
    </div>
  </div>
</div>
  `,
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
