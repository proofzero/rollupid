import {
  Form,
  useOutletContext,
} from '@remix-run/react'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { getCoreClient } from '~/platform.server'
import { authenticateAccount } from '~/utils/authenticate.server'
import { useEffect, useState } from 'react'

import type { ActionFunction } from '@remix-run/cloudflare'
import { Button, Text } from '@proofzero/design-system'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { NodeType, WebauthnAccountType } from '@proofzero/types/account'
import { fromBase64, toBase64 } from '@proofzero/utils/buffer'


type RegistrationPayload = {
  nickname: string,
  credentialId: string,
  clientDataJSON: string,
  authenticatorData: string,
  publicKey: string
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {

    const registrationPayload: RegistrationPayload = await request.json()

    console.debug("reg payload backend", registrationPayload)
    console.debug("clientDataJSON", new TextDecoder().decode(fromBase64(registrationPayload.clientDataJSON)))
    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(WebauthnAccountType.WebAuthN, registrationPayload.credentialId),
      { node_type: NodeType.WebAuthN, addr_type: WebauthnAccountType.WebAuthN },
      { alias: registrationPayload.nickname, hidden: 'false' }
    )

    const appData = await getAuthzCookieParams(request, context.env)
    const coreClient = getCoreClient({ context, accountURN })

    const { identityURN, existing } =
      await coreClient.account.resolveIdentity.query({
        jwt: await getUserSession(request, context.env, appData?.clientId),
        force:
          !appData ||
          (appData.rollup_action !== 'connect' &&
            !appData.rollup_action?.startsWith('groupconnect')),
        clientId: appData?.clientId,
      })

    return authenticateAccount(
      accountURN,
      identityURN,
      appData,
      request,
      context.env,
      context.traceSpan,
      existing
    )

  }
)

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()
  const [errorMessage, setErrorMessage] = useState('')

  const [requestedRegistration, setRequestedRegistration] = useState(false)
  const [keyName, setKeyName] = useState('')

  const registerKey = async (name: string) => {
    const challenge = new Uint8Array(64)
    crypto.getRandomValues(challenge)

    let credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: "localhost", name: "Rollup (localhost)" },
        user: {
          id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
          name,
          displayName: name + " display"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }]
      }
    });
    console.log("CREDS AFTER REGISTRATION", credential, credential instanceof PublicKeyCredential, (credential as any).response instanceof AuthenticatorAssertionResponse)
    if (credential instanceof PublicKeyCredential && credential.response instanceof AuthenticatorAttestationResponse) {
      const registrationPayload = {
        nickname: name,
        credentialId: credential.id,
        clientDataJSON: toBase64(credential.response.clientDataJSON),
        authenticatorData: toBase64(credential.response.getAuthenticatorData()),
        publicKey: toBase64(credential.response.getPublicKey() || new ArrayBuffer(0))
      }
      const response = await fetch('http://localhost:10001/authenticate/passport/webauthn/register',
        { method: 'POST', body: JSON.stringify(registrationPayload) })
      console.debug("REG FETCH RESPONSE", JSON.stringify(response))

    }
  }

  useEffect(() => {
    if (requestedRegistration) {
      registerKey(keyName)
      setRequestedRegistration(false)
    }
  }, [requestedRegistration])

  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto\
      bg-white p-6 h-[100dvh] lg:h-[580px] lg:max-h-[100dvh] w-full\
       lg:w-[418px] lg:border-rounded-lg dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600'
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
            Register Webauthn nickname
          </Text>
        </section>
        <section className="flex-1">
          <Input
            type="text"
            id="webauthn_nickname"
            label="Enter nickname for your key"
            className="h-12 rounded-lg"
            onChange={(e) => setKeyName(e.target.value)}
            skin={true}
            autoFocus
          />
          {errorMessage ? (
            <Text
              size="sm"
              weight="medium"
              className="text-red-500 mt-4 mb-2 text-center"
            >
              {errorMessage}
            </Text>
          ) : undefined}
        </section>
        <section>
          <Button
            type="submit"
            btnSize="xl"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setRequestedRegistration(true)
            }}
            className="w-full"
          >
            Register Passkey
          </Button>
        </section>
      </Form>
    </div>
  )
}
