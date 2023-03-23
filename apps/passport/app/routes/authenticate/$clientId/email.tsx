import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import { useEffect, useState } from 'react'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    clientId: params.clientId,
  })
}

type EmailPanelProps = {
  loading: boolean

  onSendCode: (email: string) => Promise<void>
  onGoBack: () => void
}

const EmailPanel = ({ loading, onSendCode, onGoBack }: EmailPanelProps) => {
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <>
      <section className="relative flex justify-center items-center mb-8">
        <HiOutlineArrowLeft
          className="absolute -left-8 -top-8 lg:left-0 lg:top-0 w-6 h-6 cursor-pointer"
          onClick={onGoBack}
        />

        <Text size="xl" weight="semibold" className="text-[#2D333A]">
          Your Email Address
        </Text>
      </section>
      <section className="flex-1">
        <Input
          type="email"
          id="email"
          label="Enter your email address"
          pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
          required
          onChange={(evt) => {
            setEmail(evt.target.value)
            setIsValidEmail(evt.target.checkValidity())
          }}
        />
      </section>
      <section>
        <Button
          btnSize="xl"
          btnType="primary-alt"
          className="w-full"
          disabled={!isValidEmail || loading}
          onClick={() => onSendCode(email)}
        >
          Send Code
        </Button>
      </section>
    </>
  )
}

export default () => {
  const { clientId } = useLoaderData()

  const [screen, setScreen] = useState<'email' | 'verify'>('email')

  const [email, setEmail] = useState<undefined | string>()
  const [state, setState] = useState<undefined | string>()

  const [verified, setVerified] = useState<undefined | boolean>()

  const navigate = useNavigate()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === 'done') {
      switch (screen) {
        case 'email':
          setState(fetcher.data.state)
          setScreen('verify')

          break
        case 'verify':
          setVerified(fetcher.data.sucessfulVerification)

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
          invalid={verified === false}
          requestRegeneration={async () => {
            if (!email) return

            const qp = new URLSearchParams()
            qp.append('address', email)

            fetcher.load(`/connect/email/otp?${qp.toString()}`)
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
                action: `/connect/email/otp`,
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
          onGoBack={() => navigate(`/authenticate/${clientId}`)}
          onSendCode={async (email) => {
            setEmail(email)

            const qp = new URLSearchParams()
            qp.append('address', email)

            fetcher.load(`/connect/email/otp?${qp.toString()}`)
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
