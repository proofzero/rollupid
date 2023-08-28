import { useEffect, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button, Text } from '@proofzero/design-system'
import { redirect } from '@remix-run/cloudflare'
import { Form, useNavigate, useOutletContext } from '@remix-run/react'

import type { ActionFunction } from '@remix-run/cloudflare'
import { BadRequestError } from '@proofzero/errors'
import { fromBase64, toBase64 } from '@proofzero/utils/buffer'
import { decode, encode } from 'cbor-x'

type LoginPayload = {
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  userHandle: string
  signature: string
}

export const action: ActionFunction = async ({ request, params }) => {
  const loginPayload: LoginPayload = await request.json()

  console.debug('reg login backend', loginPayload)
  const clientDataJSON = new TextDecoder().decode(
    fromBase64(loginPayload.clientDataJSON)
  )
  const clientDataJSONObject = JSON.parse(clientDataJSON)

  console.debug('clientDataJSONObject', clientDataJSONObject)

  const authenticatorData = new TextDecoder().decode(
    fromBase64(loginPayload.authenticatorData)
  )

  console.debug('authenticatorData', authenticatorData)

  return null

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
      const challenge = new Uint8Array(64)
      crypto.getRandomValues(challenge)
      let credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: 'localhost',
          allowCredentials: [],
          // userVerification: "required",
        },
      })
      console.log('CREDENTIAL', credential)
      if (
        credential instanceof PublicKeyCredential &&
        credential.response instanceof AuthenticatorAssertionResponse
      ) {
        const loginPayload: LoginPayload = {
          credentialId: credential?.id || '',
          clientDataJSON: toBase64(credential.response.clientDataJSON),
          authenticatorData: toBase64(credential.response.authenticatorData),
          userHandle: toBase64(
            credential.response.userHandle || new ArrayBuffer(0)
          ),
          signature: toBase64(credential.response.signature),
        }
        console.debug('LOGIN PAYLOAD', loginPayload)
        const response = await fetch(
          'http://localhost:10001/authenticate/passport/webauthn/',
          {
            method: 'POST',
            body: JSON.stringify(loginPayload),
            // redirect: 'follow',
          }
        )
      }
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
            onClick={() => {
              setLoginRequested(true)
            }}
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
        <section className="flex-1"></section>
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
