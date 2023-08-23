import { useEffect, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button, Text } from '@proofzero/design-system'
import { redirect } from '@remix-run/cloudflare'
import { useTransition } from '@remix-run/react'
import {
  Form,
  useNavigate,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'

import type { ActionFunction } from '@remix-run/cloudflare'
import {
  BadRequestError,
  ERROR_CODES,
  HTTP_STATUS_CODES,
} from '@proofzero/errors'
import { generateEmailOTP } from '~/utils/emailOTP'

export const action: ActionFunction = async ({ request, params }) => {
  const fd = await request.formData()

  const email = fd.get('email')
  if (!email)
    throw new BadRequestError({ message: 'No address included in request' })
  const state = fd.get('state')
  if (!state)
    throw new BadRequestError({ message: 'No state included in request' })

  const qp = new URLSearchParams()
  qp.append('email', email as string)
  qp.append('state', state as string)

  return redirect(
    `/authenticate/${params.clientId}/email/verify?${qp.toString()}`
  )
}

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()


  const navigate = useNavigate()

  const [loginRequested, setLoginRequested] = useState(false)

  useEffect(() => {
    const webauthnLogin = async () => {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)
      let credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: "localhost",
          allowCredentials: [],
          // userVerification: "required",
        }
      });
      console.log("CREDENTIAL", credential)
    }

    if (loginRequested) {
      webauthnLogin()
      setLoginRequested(false)
    }

  }, [loginRequested])

  return (
    <div
      className={
        'flex shrink flex-col items-center\
         justify-center gap-4 mx-auto bg-white p-6 h-[100dvh]\
          lg:h-[580px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600'
      }
      style={{
        boxSizing: 'border-box',
      }}
    >
      <Form className="flex-1 flex flex-col w-full" method="post">
        <section
          className="relative flex justify-center
         items-center mb-8 mt-6 "
        >
          <HiOutlineArrowLeft
            className="absolute left-0 lg:left-0 lg:top-[0.15rem] w-6 h-6
            text-gray-600 dark:text-white cursor-pointer"
            onClick={() => history.back()}
          />

          <Text
            size="xl"
            weight="semibold"
            className="text-[#2D333A] dark:text-white"
          >
            Passkeys
          </Text>
          <Button
            btnSize="l"
            btnType="secondary-alt-skin"
            className="w-full hover:bg-gray-100"
            disabled={loginRequested}
            onClick={() => { setLoginRequested(true) }}
          >
            Login
          </Button>
          <Button
            btnSize="l"
            btnType="secondary-alt-skin"
            className="w-full hover:bg-gray-100"
            onClick={() => navigate('register')}
          >
            Register
          </Button>

        </section>
        <section className="flex-1">
        </section>
      </Form>

      {prompt && (
        <div className="flex w-full">
          <Button
            btnSize="l"
            btnType="secondary-alt-skin"
            className="w-full hover:bg-gray-100"
            onClick={() => navigate('/authenticate/cancel')}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
