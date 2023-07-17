import { EmailContent, EmailContentType } from './src/types'
import { type EmailPlans } from './src/jsonrpc/methods/sendSuccesfullPaymentNotification'

export const darkModeStyles = `
    body {
        background-color: #1A202C;
        color: #E2E8F0;
    }
    .content, .container {
        background-color: #1A202C;
    }
    .divider {
        border-bottom-color: #4A5568;
    }
    #passcode {
        background-color: #2D3748;
    }
    .footer-links {
        color: #E2E8F0;
        border-bottom-color: #E2E8F0;
    }
    .vl {
        border-color: #E2E8F0;
    }
`

export const lightModeStyles = `
    body {
        background-color: #ffffff;
        color: #6b7280;
    }
    .content, .container {
        background-color: #ffffff;
    }
    .divider {
        border-bottom-color: #e5e7eb;
    }
    #passcode {
        background-color: #f3f4f6;
    }
    .footer-links {
        color: #6b7280;
        border-bottom-color: #6b7280;
    }
    .vl {
        border-color: #6b7280;
    }
`

export type EmailTemplateParams = {
  logoURL: string
  address?: string
  contactURL?: string
  termsURL: string
  privacyURL: string
  appName: string
}

const EmailTemplateBase = (
  params: EmailTemplateParams,
  content: string,
  subject: string
) => {
  const { logoURL, address, contactURL, termsURL, privacyURL, appName } = params
  return {
    contentType: 'text/html' as EmailContentType,
    subject,
    body: `<!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;500&display=swap"
          rel="stylesheet"
        />
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        <style type="text/css">
          body,
          .container,
          .content {
            font-family: "Inter", sans-serif;
          }

          .container {
            display: block;
            width: 98%;
            text-align: center;
          }

          .content {
            display: inline-block;
            vertical-align: top;
            text-align: left;
            max-width: 375px;
            border-radius: 8px;
          }

          .logo {
            max-width: 375px;
            margin-bottom: 37px;
          }

          .heading,
          .heading-logo {
            font-size: 36px;
            font-weight: bold;
            line-height: 44px;
            margin-bottom: 16px;
          }

          p {
            font-size: 16px;
            font-weight: normal;
            line-height: 24px;
            margin-bottom: 16px;
          }

          #passcode {
            width: 100%;
            text-align: center;
            font-size: 46px;
            font-weight: bold;
            border-radius: 8px;
            margin-top: 20px;
            margin-bottom: 20px;
            padding: 15px 0;
          }

          .divider {
            border-bottom: 1px solid #e5e7eb;
            width: 100%;
            margin-bottom: 10px;
          }

          .footer-links {
            font-size: 12px;
            text-decoration: none;
            border-bottom: 1px solid #6b7280;
            margin-right: 10px;
            width: auto;
          }

          .vl {
            border: 0.5px solid #6b7280;
            display: inline;
            margin-right: 15px;
          }

          .powered-by {
            font-size: 12px;
            text-decoration: none;
          }
        </style>

        <style type="text/css" id="injected-styles">
          ${lightModeStyles}

          @media (prefers-color-scheme: dark) {
              ${darkModeStyles}
          }
        </style>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>

      <body class="adaptive">
        <div class="container adaptive">
          <div class="content adaptive">
            <div class="heading-logo">
              <img class="logo" src="${logoURL}" alt="" style="display: block" />
            </div>
            ${content}
            <div class="divider"></div>
            <div style="width: 100%">
              <a
                class="footer-links"
                href="${termsURL}"
                target="_blank"
                rel="noreferrer"
                >Terms & Conditions</a
              >
              <div class="vl"></div>
              <a
                class="footer-links"
                href="${privacyURL}"
                target="_blank"
                rel="noreferrer"
                >Privacy Policy</a
              >
              ${
                contactURL && contactURL !== ''
                  ? `
              <div class="vl"></div>
              <a
                class="footer-links"
                href="${contactURL}"
                target="_blank"
                rel="noreferrer"
                >Contact Us</a
              >`
                  : ''
              }
            </div>

            ${
              address && address !== ''
                ? `
            <pre
              style="
                font-size: 12px;
                line-height: 16px;
                color: #6b7280;
                margin-bottom: 4px;
                margin-top: 10px;
              "
            >${address}</pre>`
                : ''
            }
            <p
              style="
                font-size: 12px;
                line-height: 20px;
                color: #6b7280;
                margin-bottom: 10px;
              "
            >
              All rights reserved.
            </p>
            <div style="display: inline-block; text-align: center">
              <img
                src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/71edc886-0478-4584-beca-a6715937f000/public"
                alt=""
                style="max-width: 11px; display: inline-block"
              />
              <p
                style="
                  font-size: 12px;
                  line-height: 12px;
                  color: #9ca3af;
                  display: inline-block;
                  margin-bottom: 10px;
                "
              >
                Powered by
                <a
                  href="https://rollup.id"
                  target="_blank"
                  rel="noreferrer"
                  class="powered-by"
                  >rollup.id</a
                >
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>`,
  }
}

export const EmailTemplateOTP = (
  passcode: string,
  params: EmailTemplateParams
): EmailContent => {
  const content = `
            <div class="heading">Confirm Your Email Address</div>
            <p>Please copy the code below into the email verification screen.</p>
            <div id="passcode">${passcode}</div>
            <p>Please note: the code will be valid for the next 10 minutes.</p>
            <p>
              If you didn&apos;t request this email, there&apos;s nothing to worry
              about - you can safely ignore it.
            </p>
            `

  const subject = `Your ${params.appName ?? `Rollup ID`} one-time passcode`

  return EmailTemplateBase(params, content, subject)
}

export const EmailTemplateExpiredSubscription = (
  params: EmailTemplateParams
): EmailContent => {
  const content = `<div class="heading">RollupId subscription has been cancelled</div>
  <p>
    Your subscription has been cancelled due to unsuccessful payment
    attempts.
  </p>
  <p>
    Please update your payment details to reactivate your subscription.
  </p>
  `

  const subject = `Your Rollup ID subscription has been cancelled`

  return EmailTemplateBase(params, content, subject)
}

export const EmailTemplateBillingReconciledEntitlements = (
  params: EmailTemplateParams,
  {
    reconciledEntitlements,
    billingURL,
  }: {
    reconciledEntitlements: { type: string; count: number }[]
    billingURL: string
  }
): EmailContent => {
  const content = `<div class="heading">Entitlement(s) Removed 🗑️</div>
  <p>Following changes have been made to your account:</p>
  <ul>
    ${reconciledEntitlements
      .map(
        (entitlement) =>
          `<li>${entitlement.count} x ${entitlement.type} Entitlement(s) removed</li>`
      )
      .join('')}
  </ul>
  <p>For more information you can visit the <a href=${billingURL}>Billing & Invoicing section.</p>

  <p>
  Thank You for using Rollup <br />
  - The Rollup Team
  </p>`

  return EmailTemplateBase(params, content, 'Entitlement(s) Removed')
}

export const EmailTemplateDevReconciledEntitlements = (
  params: EmailTemplateParams,
  {
    appName,
    planType,
    settingsURL,
  }: {
    appName: string
    planType: string
    settingsURL: string
  }
): EmailContent => {
  const content = `<div class="heading">Application Plan Downgraded ⬇️</div>

  <p>
    Rollup application <b>"${appName}"</b> was downgraded to <b>${planType}</b> plan.
  </p>

  <p>
    To review your account and all applications <a href=${settingsURL}>click here</a>.
  </p>

  <p>
  Thank You for using Rollup <br />
  - The Rollup Team
  </p>`

  return EmailTemplateBase(params, content, 'App Downgraded')
}

export const EmailTemplateFailedPayment = (
  params: EmailTemplateParams
): EmailContent => {
  const content = `<div class="heading">Payment Issue Detected</div>

  <p>
    Your payment for the Rollup ID has failed.
  </p>

  <p>
    Please update your payment details on the <a href=${'https://console.rollup.id/billing'}>billing page</a>.
  </p>

  <p>
  Thank You for using Rollup <br />
    - The Rollup Team
  </p>`

  return EmailTemplateBase(params, content, 'Action Required for Rollup ID')
}

export const EmailTemplateSuccessfulPayment = ({
  params,
  plans,
}: {
  params: EmailTemplateParams
  plans: EmailPlans
}): EmailContent => {
  const content = `<div class="heading">Payment Successful</div>
  <p>
    Your payment for the <b>Rollup ID</b> has been processed successfully.
  </p>

  <p>
    Thank you for your continued support. Enjoy using <b>Rollup ID</b>!
  </p>

  <p> Here's the list of your purchases: </p>
  <ul>
  ${plans.map((plan) => {
    return `<li>${plan.quantity} entitlement(s) of <b>${plan.name}</b></li>`
  })}
  </ul>

  <p>
    Best, <br />
    - The Rollup Team
  </p>`

  return EmailTemplateBase(params, content, 'Payment Successful')
}
