import { EmailContent } from './src/types'

export const EmailTemplate = (passcode: string): EmailContent => {
  return {
    contentType: 'text/html',
    subject: `Email verification - one-time passcode`,
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
        width: 100%;
        text-align: center;
        background-color: #ffffff;
      }
      .content {
        display: inline-block;
        vertical-align: top;
        text-align: left;
        width: 375px;
        border-radius: 8px;
        padding: 40px 24px;
        margin: 0 auto;
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
        margin-bottom: 20px;
        margin-top: 50px;
      }
      .footer-links {
        font-size: 12px;
        font-weight: bold;
        color: #6b7280;
        text-decoration: none;
        border-bottom: 1px solid #6b7280;
        margin-right: 10px;
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
    </style>
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
  </head>
  <body>
    <div class="container">
      <div class="content">
        <img
          class="logo"
          src="data:image/png;base64,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"
          alt="rollup logo"
        />
        <div class="heading">Confirm Your Email Address</div>
        <p>
          Please copy and paste the 6-digit code below into the number fields of
          your verification process.
        </p>
        <div id="passcode">${passcode}</div>
        <p>Please note: the code will be valid for the next 10 minutes.</p>
        <p>
          If you didn&apos;t request this email, there&apos;s nothing to worry
          about - you can safely ignore it.
        </p>
        <div class="divider"></div>
        <div style="text-align: center; width: 100%">
          <a
            class="footer-links"
            href="https://rollup.id/tos"
            target="_blank"
            rel="noreferrer"
            >Terms & Conditions</a
          >
          <div class="vl"></div>
          <a
            class="footer-links"
            href="https://rollup.id/privacy-policy"
            target="_blank"
            rel="noreferrer"
            >Privacy Policy</a
          >
          <div class="vl"></div>
          <a
            class="footer-links"
            href="https://discord.com/invite/rollupid"
            target="_blank"
            rel="noreferrer"
            >Contact Us</a
          >
        </div>

        <p
          style="
            font-size: 12px;
            line-height: 16px;
            color: #6b7280;
            margin-bottom: 4px;
            margin-top: 20px;
          "
        >
        777 Bay Street, Suite C208B Toronto, Ontario M5G 2C8 Canada
        </p>
        <p
          style="
            font-size: 12px;
            line-height: 20px;
            color: #6b7280;
            margin-bottom: 20px;
          "
        >
          All rights reserved.
        </p>
        <div style="display: inline-block; text-align: center">
          <img
            src="data:image/png;base64,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"
            alt="rollup logo"
            style="
              max-width: 15px;
              margin-right: 3px;
              display: inline;
            "
          />
          <p
            style="
              font-size: 12px;
              line-height: 12px;
              color: #9ca3af;
              display: inline;
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
