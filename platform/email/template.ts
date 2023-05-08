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
        background-color: white;
      }
      .container {
        display: block;
        width: 100%;
        text-align: center;
      }
      .content {
        display: inline-block;
        vertical-align: top;
        text-align: left;
        width: 375px;
        border-radius: 8px;
        padding: 40px 24px;
        margin: 0 auto;
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
          src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/70676dfd-2899-4556-81ef-e5f48f5eb900/public"
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
          Proof Zero Inc, 4 Collier Street, 2nd Floor, Toronto, ON M4W 2G9,
          Canada
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
            src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/ee4205c5-eccb-4b28-d4c6-6a3e5fe39100/public"
            alt="rollup logo"
            style="width: 14px; height: 14px; margin-right: 10px"
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
