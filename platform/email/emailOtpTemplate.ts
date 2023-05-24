import { EmailContent } from './src/types'

export type EmailTemplateParams = {
  logoURL: string
  address?: string
  contactURL?: string
  termsURL: string
  privacyURL: string
}

export const EmailTemplate = (
  passcode: string,
  params: EmailTemplateParams
): EmailContent => {
  const { logoURL, address, contactURL, termsURL, privacyURL } = params

  return {
    contentType: 'text/html',
    subject: `Your Rollup ID one-time passcode`,
    body: `
    <!DOCTYPE html>
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
          body {
            font-family: Inter;
            background-color: #ffffff;
          }
          .container {
            display: block;
            width: 98%;
            text-align: center;
            background-color: #ffffff;
          }
          .content {
            display: inline-block;
            vertical-align: top;
            text-align: left;
            max-width: 375px;
            border-radius: 8px;
            background-color: #ffffff;
          }
          .logo {
            width: 170px;
            margin-bottom: 37px;
          }
          .heading {
            font-size: 36px;
            font-weight: bold;
            line-height: 44px;
            margin-bottom: 16px;
          }
          .heading-logo {
            font-size: 36px;
            font-weight: bold;
            line-height: 44px;
          }
          .heading-logo .logo {
            width: 32px;
            height: 32px;
          }
          p {
            font-size: 16px;
            font-weight: normal;
            line-height: 24px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          #passcode {
            background-color: #f3f4f6;
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
            color: #6b7280;
            text-decoration: none;
            border-bottom: 1px solid #6b7280;
            margin-right: 10px;
            width: auto;
          }
          .vl {
            border: 0.5px solid black;
            display: inline;
            margin-right: 15px;
          }
          .powered-by {
            font-size: 12px;

            color: #9ca3af;
            text-decoration: none;
          }
          @media (prefers-color-scheme: dark) {
            .content.apaptive {
              background-color: #ffffff;
            }
            .container.apaptive {
              background-color: #ffffff;
            }
            body.apaptive {
              background-color: #ffffff;
            }
          }
        </style>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body class="adaptive">
        <div class="container adaptive">
          <div class="content adaptive">
            <div class="heading-logo">
              <img
                class="logo"
                src="${logoURL}"
                alt=""
                style="display: block"
              />
            </div>
            <div class="heading">Confirm Your Email Address</div>
            <p>Please copy the code below into the email verification screen.</p>
            <div id="passcode">${passcode}</div>
            <p>Please note: the code will be valid for the next 10 minutes.</p>
            <p>
              If you didn&apos;t request this email, there&apos;s nothing to worry
              about - you can safely ignore it.
            </p>
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
                contactURL !== ''
                  ? `<div class="vl"></div><a
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
              address !== ''
                ? `<pre
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
    </html>
  `,
  }
}
