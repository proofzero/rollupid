import { Form, useLoaderData, useOutletContext } from '@remix-run/react'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { getCoreClient } from '~/platform.server'
import { authenticateAccount } from '~/utils/authenticate.server'
import { useEffect, useState } from 'react'

import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from '@remix-run/cloudflare'
import { Button, Text } from '@proofzero/design-system'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { NodeType, WebauthnAccountType } from '@proofzero/types/account'
import { fromBase64, toBase64 } from '@proofzero/utils/buffer'
import { Fido2Lib } from 'fido2-lib'
import { base64url } from 'jose'

type RegistrationPayload = {
  nickname: string
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  attestationObject: string
  publicKey: string
  rawId: string
}

const fixedChallenge =
  '9czL/AqVkQah8J127PTEShBn6GJUOhS5oivgYu3xby7k/mwk/+bEViam0yNSbHpt74o5yXW0MHkchNhA4B37dA=='

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: 'localhost',
      rpName: 'Rollup (localhost)',
      challengeSize: 64,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorAttachment: 'platform',
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })
    const registrationOptions = (await f2l.attestationOptions()) as any
    registrationOptions.challenge = fixedChallenge
    console.debug(
      'REGISTRATION OPTIONS',
      JSON.stringify(registrationOptions, null, 2)
    )
    return json({ registrationOptions })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const registrationPayload: RegistrationPayload = await request.json()

    console.debug('reg payload backend', registrationPayload)

    const f2l = new Fido2Lib(
      {
        timeout: 42,
        rpId: 'localhost',
        rpName: 'Rollup (localhost)',
        challengeSize: 64,
        attestation: 'none',
        cryptoParams: [-7, -257],
        authenticatorAttachment: 'platform',
        authenticatorRequireResidentKey: false,
        authenticatorUserVerification: 'required',
      }
    )

    //This throws in case it can't verify 
    const registrationResults = await f2l.attestationResult(
      {
        rawId: base64url.decode(registrationPayload.rawId).buffer,
        response: {
          clientDataJSON: registrationPayload.clientDataJSON,
          attestationObject: registrationPayload.attestationObject,
        },
      },
      {
        origin: 'http://localhost:10001',
        challenge: fixedChallenge,
        factor: 'first',
      }
    )

    const webauthnData = {
      counter: registrationResults.authnrData.get("counter"),
      // credentialId: registrationResults.request.id,
      publicKey: registrationResults.authnrData.get("credentialPublicKeyPem"),
    }

    console.debug(
      'AFTER VERIFICATION REG RESULTS',
      registrationPayload.credentialId, webauthnData
    )

    console.debug(
      'clientDataJSON',
      new TextDecoder().decode(fromBase64(registrationPayload.clientDataJSON))
    )

    //TODO: verify challenge before continuing; loader creates signed challenge, action verifies it

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(
        WebauthnAccountType.WebAuthN,
        registrationPayload.credentialId
      ),
      { node_type: NodeType.WebAuthN, addr_type: WebauthnAccountType.WebAuthN },
      { alias: registrationPayload.credentialId }
    )

    console.debug('REGISTRATION ACCOUNTURN', accountURN)

    const appData = await getAuthzCookieParams(request, context.env)
    const coreClient = getCoreClient({ context, accountURN })

    await coreClient.account.setWebAuthNData.mutate(webauthnData)
    await coreClient.account.setNickname.query({
      nickname: registrationPayload.nickname,
    })

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

  const { registrationOptions } = useLoaderData()
  console.debug(
    'REGISTRAION OPTIONS CLIENT',
    JSON.stringify(registrationOptions, null, 2)
  )

  if (
    registrationOptions &&
    registrationOptions.challenge &&
    typeof registrationOptions.challenge === 'string'
  ) {
    // console.debug("STRING TO DECODE", registrationOptions.challenge)
    // alert(registrationOptions.challenge + " " + typeof registrationOptions.challenge)
    registrationOptions.challenge = fromBase64(registrationOptions.challenge)
  }
  const [errorMessage, setErrorMessage] = useState('')

  const [requestedRegistration, setRequestedRegistration] = useState(false)
  const [keyName, setKeyName] = useState('')

  const registerKey = async (name: string) => {
    registrationOptions.user = {
      id: new TextEncoder().encode('asdfasdfasdfa'),
      name,
      displayName: name,
    }
    let credential = await navigator.credentials.create({
      publicKey: registrationOptions,
    })
    console.log(
      'CREDS AFTER REGISTRATION',
      credential,
      credential instanceof PublicKeyCredential,
      (credential as any).response instanceof AuthenticatorAssertionResponse
    )
    if (
      credential instanceof PublicKeyCredential &&
      credential.response instanceof AuthenticatorAttestationResponse
    ) {
      const registrationPayload = {
        nickname: name,
        credentialId: credential.id,
        rawId: base64url.encode(new Uint8Array(credential.rawId)),
        clientDataJSON: base64url.encode(
          new Uint8Array(credential.response.clientDataJSON)
        ),
        authenticatorData: base64url.encode(
          new Uint8Array(credential.response.getAuthenticatorData())
        ),
        attestationObject: base64url.encode(
          new Uint8Array(credential.response.attestationObject)
        ),
        publicKey: toBase64(
          credential.response.getPublicKey() || new ArrayBuffer(0)
        ),
      }
      const response = await fetch(
        'http://localhost:10001/authenticate/passport/webauthn/register',
        {
          method: 'POST',
          body: JSON.stringify(registrationPayload),
          redirect: 'follow',
        }
      )
      console.debug('REG FETCH RESPONSE', JSON.stringify(response))
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
