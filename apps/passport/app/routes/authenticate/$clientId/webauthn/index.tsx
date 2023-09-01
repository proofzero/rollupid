import { useEffect, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button, Text } from '@proofzero/design-system'
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'

import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from '@remix-run/cloudflare'
import { InternalServerError } from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { NodeType, WebauthnAccountType } from '@proofzero/types/account'
import { getCoreClient } from '~/platform.server'
import { Fido2Lib } from 'fido2-lib'
import { base64url } from 'jose'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { authenticateAccount } from '~/utils/authenticate.server'
import { AuthButton } from '@proofzero/design-system/src/molecules/auth-button/AuthButton'
import { TosAndPPol } from '@proofzero/design-system/src/atoms/info/TosAndPPol'
import subtractLogo from '~/assets/subtract-logo.svg'
import { TbFingerprint } from 'react-icons/tb'
import webauthnNewKeyIcon from './WebauthnNewKeyIcon'
import {
  verifySignedWebauthnChallenge,
  KeyPairSerialized,
  createSignedWebauthnChallenge,
} from './utils'

type LoginPayload = {
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  userHandle: string
  signature: string
  rawId: string
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    // const loginPayload: LoginPayload = await request.json()
    const formdata = await request.formData()
    const loginPayload = {
      credentialId: formdata.get('credentialId') as string,
      authenticatorData: formdata.get('authenticatorData') as string,
      clientDataJSON: formdata.get('clientDataJSON') as string,
      userHandle: formdata.get('userHandle') as string,
      signature: formdata.get('signature') as string,
      rawId: formdata.get('rawId') as string,
    }

    const clientDataJSON = new TextDecoder().decode(
      base64url.decode(loginPayload.clientDataJSON)
    )
    const clientDataJSONObject = JSON.parse(clientDataJSON)
    const challenge = new TextDecoder().decode(
      base64url.decode(clientDataJSONObject.challenge)
    )
    const webauthnChallengeJwks = JSON.parse(
      context.env.SECRET_WEBAUTHN_SIGNING_KEY
    ) as KeyPairSerialized
    await verifySignedWebauthnChallenge(challenge, webauthnChallengeJwks)

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(
        WebauthnAccountType.WebAuthN,
        loginPayload.credentialId
      ),
      { node_type: NodeType.WebAuthN, addr_type: WebauthnAccountType.WebAuthN },
      { alias: loginPayload.credentialId }
    )

    const coreClient = getCoreClient({ context, accountURN })

    const webAuthnData = await coreClient.account.getWebAuthNData.query()

    if (!webAuthnData || !webAuthnData.counter || !webAuthnData.publicKey)
      throw new InternalServerError({
        message:
          'Could not retrieve passkey data. Try again or register new key.',
      })

    const passportUrl = new URL(request.url)
    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: passportUrl.hostname,
      rpName: 'Rollup ID',
      challengeSize: 200,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorAttachment: 'cross-platform',
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })

    const loginResult = await f2l.assertionResult(
      {
        response: {
          authenticatorData: base64url.decode(loginPayload.authenticatorData)
            .buffer,
          clientDataJSON: loginPayload.clientDataJSON,
          signature: loginPayload.signature,
          userHandle: loginPayload.userHandle,
        },
        rawId: base64url.decode(loginPayload.rawId).buffer,
      },
      {
        challenge: clientDataJSONObject.challenge,
        factor: 'first',
        origin: passportUrl.origin,
        prevCounter: webAuthnData.counter,
        publicKey: webAuthnData.publicKey,
        userHandle: loginPayload.userHandle,
      }
    )

    const appData = await getAuthzCookieParams(request, context.env)

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

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const passportUrl = new URL(request.url)
    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: passportUrl.hostname,
      rpName: 'Rollup ID',
      challengeSize: 200,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorAttachment: 'cross-platform',
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })
    const loginOptions = (await f2l.assertionOptions()) as any
    const webauthnChallengeJwks = JSON.parse(
      context.env.SECRET_WEBAUTHN_SIGNING_KEY
    ) as KeyPairSerialized
    const challengeJwt = await createSignedWebauthnChallenge(
      webauthnChallengeJwks
    )
    loginOptions.challenge = challengeJwt
    return json({ loginOptions, passportOrigin: passportUrl.origin })
  }
)

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()

  const { loginOptions, passportOrigin } = useLoaderData()
  const navigate = useNavigate()
  const submit = useSubmit()

  const [loginRequested, setLoginRequested] = useState(false)

  useEffect(() => {
    const webauthnLogin = async () => {
      let credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(loginOptions.challenge),
          rpId: new URL(passportOrigin).hostname,
          allowCredentials: [],
        },
      })
      if (
        credential instanceof PublicKeyCredential &&
        credential.response instanceof AuthenticatorAssertionResponse
      ) {
        const loginPayload: LoginPayload = {
          credentialId: credential?.id || '',
          clientDataJSON: base64url.encode(
            new Uint8Array(credential.response.clientDataJSON)
          ),
          authenticatorData: base64url.encode(
            new Uint8Array(credential.response.authenticatorData)
          ),
          userHandle: base64url.encode(
            new Uint8Array(credential.response.userHandle || new ArrayBuffer(0))
          ),
          signature: base64url.encode(
            new Uint8Array(credential.response.signature)
          ),
          rawId: base64url.encode(new Uint8Array(credential.rawId)),
        }

        const submitPayload = new FormData()
        submitPayload.set('credentialId', loginPayload.credentialId)
        submitPayload.set('clientDataJSON', loginPayload.clientDataJSON)
        submitPayload.set('authenticatorData', loginPayload.authenticatorData)
        submitPayload.set('userHandle', loginPayload.userHandle)
        submitPayload.set('signature', loginPayload.signature)
        submitPayload.set('rawId', loginPayload.rawId)
        submit(submitPayload, { method: 'post' })
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
            Connect with Passkey
          </Text>
        </section>
        <section>
          <div className="flex-1 w-full flex flex-col gap-4 relative">
            <AuthButton
              disabled={loginRequested}
              Graphic={
                <TbFingerprint className="w-full h-full dark:text-white"></TbFingerprint>
              }
              onClick={() => {
                setLoginRequested(true)
              }}
              text="Use existing Passkey"
            />
            <AuthButton
              Graphic={
                <img
                  src={webauthnNewKeyIcon}
                  className="w-full h-full dark:text-white"
                />
              }
              onClick={() => navigate('register')}
              text="Add new Passkey"
            />
          </div>
        </section>
        <section className="flex-1"></section>
      </Form>

      {prompt && (
        <div className="flex w-full">
          <Button
            btnSize="l"
            className="w-full hover:bg-gray-100"
            onClick={() => navigate('/authenticate/cancel')}
          >
            Cancel
          </Button>
        </div>
      )}
      <div className="mt-14 flex justify-center items-center space-x-2">
        <img src={subtractLogo} alt="powered by rollup.id" />
        <Text size="xs" weight="normal" className="text-gray-400">
          Powered by{' '}
          <a href="https://rollup.id" className="hover:underline">
            rollup.id
          </a>
        </Text>
        <TosAndPPol />
      </div>
    </div>
  )
}
