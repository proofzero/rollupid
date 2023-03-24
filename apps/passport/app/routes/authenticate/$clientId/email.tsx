import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import { EmailPanel } from '~/components/email/EmailPanel'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import { useEffect, useState } from 'react'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    clientId: params.clientId,
  })
}

export default () => {
  const { clientId } = useLoaderData()

  const [screen, setScreen] = useState<'email' | 'verify'>('email')

  const [email, setEmail] = useState<undefined | string>()
  const [state, setState] = useState<undefined | string>()
  const [error, setError] = useState<undefined | string>()

  const [invalid, setInvalid] = useState<boolean>(false)

  const navigate = useNavigate()

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === 'done') {
      switch (screen) {
        case 'email':
          if (fetcher.data.error) {
            setError(fetcher.data.message)
          } else if (fetcher.data.state) {
            setError(undefined)
            setState(fetcher.data.state)
            setScreen('verify')
          }

          break
        case 'verify':
          if (fetcher.data.error) {
            setError(fetcher.data.message)
          } else if (fetcher.data.state) {
            setError(undefined)
            setState(fetcher.data.state)
          }

          if (fetcher.data.invalid) {
            setInvalid(true)
          }

          break
      }
    }
  }, [fetcher])

  let component = null
  switch (screen) {
    case 'verify':
      component = (
        <EmailOTPValidator
          loading={fetcher.state !== 'idle'}
          email={email!}
          state={state!}
          invalid={invalid}
          error={error}
          requestRegeneration={async () => {
            if (!email) return

            const qp = new URLSearchParams()
            qp.append('address', email)

            fetcher.load(`/connect/email/register?${qp.toString()}`)
          }}
          requestVerification={async (email, code, state) => {
            fetcher.submit(
              {
                address: email,
                code,
                state,
              },
              {
                method: 'post',
                action: `/connect/email/register`,
              }
            )
          }}
          goBack={() => setScreen('email')}
        />
      )
      break
    case 'email':
    default:
      component = (
        <EmailPanel
          loading={fetcher.state !== 'idle'}
          error={error}
          onGoBack={() => navigate(`/authenticate/${clientId}`)}
          onSendCode={async (email) => {
            setEmail(email)

            const qp = new URLSearchParams()
            qp.append('address', email)

            fetcher.load(`/connect/email/register?${qp.toString()}`)
          }}
        />
      )
  }

  return (
    <>
      {fetcher.state !== 'idle' && <Loader />}

      <div
        className={
          'flex shrink flex-col gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px] lg:border-rounded-lg'
        }
        style={{
          border: '1px solid #D1D5DB',
          boxSizing: 'border-box',
        }}
      >
        {component}
      </div>
    </>
  )
}
