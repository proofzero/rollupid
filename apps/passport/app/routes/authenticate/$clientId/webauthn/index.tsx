import { useEffect, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button, Text } from '@proofzero/design-system'
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'

import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from '@remix-run/cloudflare'
import { BadRequestError } from '@proofzero/errors'
import { fromBase64, toBase64 } from '@proofzero/utils/buffer'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { NodeType, WebauthnAccountType } from '@proofzero/types/account'
import { getCoreClient } from '~/platform.server'
import { Fido2Lib } from 'fido2-lib'
import { JWK, base64url } from 'jose'
import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT, importJWK } from 'jose'
import { decrypt, encrypt, importKey } from '@proofzero/utils/crypto'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

type LoginPayload = {
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  userHandle: string
  signature: string
  rawId: string
}

const fixedChallenge =
  '9czL/AqVkQah8J127PTEShBn6GJUOhS5oivgYu3xby7k/mwk/+bEViam0yNSbHpt74o5yXW0MHkchNhA4B37dA=='

type KeyPairSerialized = {
  publicKey: JWK,
  privateKey: JWK
}

export const createSignedWebauthnChallenge = async (keyPairJSON: KeyPairSerialized) => {
  const privateKey = await importJWK(keyPairJSON.privateKey)
  const payload = { challenge: 'asdf' }
  const challengeJwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setExpirationTime('5 min')
    .sign(privateKey)
  return challengeJwt
}

export const verifySignedWebauthnChallenge = async (challengeJwt: string, keyPairJSON: KeyPairSerialized) => {
  const publicKey = await importJWK(keyPairJSON.publicKey)
  const verificationResults = await jwtVerify(challengeJwt, publicKey)
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const loginPayload: LoginPayload = await request.json()
    console.debug('reg login backend', loginPayload)
    const clientDataJSON = new TextDecoder().decode(
      base64url.decode(loginPayload.clientDataJSON)
    )
    const clientDataJSONObject = JSON.parse(clientDataJSON)
    console.debug('clientDataJSONObject', clientDataJSONObject)
    const challenge = new TextDecoder().decode(base64url.decode(clientDataJSONObject.challenge))
    console.debug('\n\n\nDECODED CHALLENGE', challenge)
    const webauthnChallengeJwks = JSON.parse(context.env.SECRET_WEBAUTHN_SIGNING_KEY) as KeyPairSerialized
    await verifySignedWebauthnChallenge(challenge, webauthnChallengeJwks)


    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(
        WebauthnAccountType.WebAuthN,
        loginPayload.credentialId
      ),
      { node_type: NodeType.WebAuthN, addr_type: WebauthnAccountType.WebAuthN },
      { alias: loginPayload.credentialId }
    )

    console.debug('LOGIN ACCOUNTURN', accountURN)

    const coreClient = getCoreClient({ context, accountURN })

    const webAuthnData = await coreClient.account.getWebAuthNData.query()

    console.log('WEBAUTHN DATA IN STORAGE', webAuthnData)

    const passportUrl = new URL(request.url)
    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: passportUrl.hostname,
      rpName: 'Rollup ID',
      challengeSize: 200,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorAttachment: 'platform',
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
    console.debug(
      'ASSERTION RESPONSE',
      JSON.stringify(
        Object.fromEntries(loginResult.authnrData.entries()),
        null,
        2
      )
    )

    return null
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
      authenticatorAttachment: 'platform',
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })
    const loginOptions = (await f2l.assertionOptions()) as any
    const webauthnChallengeJwks = JSON.parse(context.env.SECRET_WEBAUTHN_SIGNING_KEY) as KeyPairSerialized
    const challengeJwt = await createSignedWebauthnChallenge(webauthnChallengeJwks)
    console.debug("CHALLENGE JWT", challengeJwt)
    loginOptions.challenge = challengeJwt
    console.debug('LOGIN OPTIONS', JSON.stringify(loginOptions, null, 2))
    return json({ loginOptions, passportOrigin: passportUrl.origin })
  }
)

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()

  const { loginOptions, passportOrigin } = useLoaderData()
  const navigate = useNavigate()

  const [loginRequested, setLoginRequested] = useState(false)

  useEffect(() => {
    const webauthnLogin = async () => {
      let credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(loginOptions.challenge),
          rpId: new URL(passportOrigin).hostname,
          allowCredentials: [],
          // userVerification: "required",
        },
      })
      console.log('CREDENTIAL', credential)
      if (
        credential instanceof PublicKeyCredential &&
        credential.response instanceof AuthenticatorAssertionResponse
      ) {
        console.log("NEW CLIENTJSON", JSON.parse(new TextDecoder().decode(credential.response.clientDataJSON)).challenge)
        console.log("CHALLENGES", {
          textEncoder: new TextDecoder().decode(new TextEncoder().encode(loginOptions.challenge)),
          b64decoded: new TextDecoder().decode(base64url.decode(JSON.parse(new TextDecoder().decode(credential.response.clientDataJSON)).challenge))
        })
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
        console.log('LOGIN PAYLOAD', loginPayload)
        const response = await fetch(
          `${passportOrigin}/authenticate/passport/webauthn/`,
          {
            method: 'POST',
            body: JSON.stringify(loginPayload),
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
