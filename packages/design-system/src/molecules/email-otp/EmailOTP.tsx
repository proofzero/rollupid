import React from 'react'

export default function EmailOTP() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'start',
        width: '375px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '40px 24px',
      }}
    >
      <img
        src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/0609d5b5-fa07-4947-d560-a5993d067500/public"
        alt="rollup logo"
        style={{ width: '170px', paddingBottom: '37px' }}
      />
      <div
        style={{
          fontSize: '36px',
          fontWeight: '600',
          lineHeight: '44px',
          paddingBottom: '16px',
          letterSpacing: '-0.05em',
          fontFamily: 'Inter',
          fontStyle: 'normal',
        }}
      >
        Confirm Your Email Address
      </div>
      <p
        style={{
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          color: '#6B7280',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter',
          fontStyle: 'normal',
        }}
      >
        Please copy and paste the 6-digit code below into the number fields of
        your verification process.
      </p>
      <div
        style={{
          backgroundColor: '#F3F4F6',
          width: '100%',
          textAlign: 'center',
          fontSize: '46px',
          fontWeight: '600',
          borderRadius: '8px',
          marginTop: '20px',
          marginBottom: '20px',
          paddingTop: '15px',
          paddingBottom: '15px',
        }}
      >
        <h1>XRTY08</h1>
      </div>
      <p
        style={{
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          color: '#6B7280',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter',
          paddingBottom: '24px',
          fontStyle: 'normal',
        }}
      >
        Please note: the code will be valid for the next 10 minutes.
      </p>
      <p
        style={{
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          color: '#6B7280',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter',
          paddingBottom: '40px',
          fontStyle: 'normal',
        }}
      >
        If you didn&apos;t request this email, there&apos;s nothing to worry
        about - you can safely ignore it.
      </p>
      <div
        style={{
          borderBottom: '1px solid black',
          width: '100%',
          borderColor: '#E5E7EB',
        }}
      />
      <div
        style={{
          marginTop: '20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          paddingBottom: '24px',
        }}
      >
        <div
          style={{
            marginRight: '5%',
          }}
        >
          <a
            style={{
              fontSize: '12px',
              fontWeight: '500',
              lineHeight: '12px',
              color: '#6B7280',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              borderBottom: '1px solid black',
              borderColor: '#6B7280',
            }}
            href="https://rollup.id/tos"
            target="_blank"
            rel="noreferrer"
          >
            Terms & conditions
          </a>
        </div>
        <div
          style={{
            borderLeft: '1px solid black',
            paddingLeft: '5%',
            paddingRight: '5%',
            borderColor: '#6B7280',
          }}
        >
          <a
            style={{
              fontSize: '12px',
              fontWeight: '500',
              lineHeight: '12px',
              color: '#6B7280',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              borderBottom: '1px solid black',
              borderColor: '#6B7280',
            }}
            href="https://rollup.id/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy policy
          </a>
        </div>
        <div
          style={{
            borderLeft: '1px solid black',
            paddingLeft: '5%',
            borderColor: '#6B7280',
          }}
        >
          <a
            style={{
              fontSize: '12px',
              fontWeight: '500',
              lineHeight: '12px',
              color: '#6B7280',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              borderBottom: '1px solid black',
              borderColor: '#6B7280',
            }}
            href="https://discord.com/invite/rollupid"
            target="_blank"
            rel="noreferrer"
          >
            Contact us
          </a>
        </div>
      </div>
      <p
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          color: '#6B7280',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter',
          fontStyle: 'normal',
          paddingBottom: '4px',
        }}
      >
        Proof Zero Inc, 4 World Trade Center, 150 Greenwich Street, 62nd Floor,
        New York, NY 10007, USA
      </p>
      <p
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '20px',
          color: '#6B7280',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter',
          fontStyle: 'normal',
          paddingBottom: '50px',
        }}
      >
        All rights reserved.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '5px',
        }}
      >
        <img
          src="https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/ee4205c5-eccb-4b28-d4c6-6a3e5fe39100/public"
          alt="rollup logo"
        />
        <p
          style={{
            fontSize: '12px',
            fontWeight: '500',
            lineHeight: '12px',
            color: '#6B7280',
            letterSpacing: '-0.02em',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            marginTop: 'auto',
          }}
        >
          Powered by rollup.id
        </p>
      </div>
    </div>
  )
}
