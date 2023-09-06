import { Form, useLoaderData, useSubmit } from '@remix-run/react'
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
import { Fido2Lib } from 'fido2-lib'
import { base64url } from 'jose'
import { TosAndPPol } from '@proofzero/design-system/src/atoms/info/TosAndPPol'
import subtractLogo from '~/assets/subtract-logo.svg'
import {
  createSignedWebauthnChallenge,
  verifySignedWebauthnChallenge,
} from './utils'
import { BadRequestError } from '@proofzero/errors'
import { KeyPairSerialized } from '@proofzero/packages/types/application'

type RegistrationPayload = {
  nickname: string
  credentialId: string
  clientDataJSON: string
  attestationObject: string
  rawId: string
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const passportUrl = new URL(request.url)

    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: passportUrl.hostname,
      rpName: 'Rollup ID',
      challengeSize: 64,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })
    const registrationOptions = (await f2l.attestationOptions()) as any
    const webauthnChallengeJwks = JSON.parse(
      context.env.SECRET_WEBAUTHN_SIGNING_KEY
    ) as KeyPairSerialized
    const challengeJwt = await createSignedWebauthnChallenge(
      webauthnChallengeJwks
    )
    registrationOptions.challenge = challengeJwt
    return json({ registrationOptions })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const formdata = await request.formData()
    const registrationPayload: RegistrationPayload = {
      credentialId: formdata.get('credentialId') as string,
      clientDataJSON: formdata.get('clientDataJSON') as string,
      attestationObject: formdata.get('attestationObject') as string,
      nickname: formdata.get('nickname') as string,
      rawId: formdata.get('rawId') as string,
    }

    if (
      !registrationPayload.nickname ||
      (registrationPayload.nickname?.length < 4)
    )
      throw new BadRequestError({
        message: 'Name of key is required to be 4 or more characters',
      })

    const clientDataJSON = new TextDecoder().decode(
      base64url.decode(registrationPayload.clientDataJSON)
    )

    const clientDataJSONObject = JSON.parse(clientDataJSON)
    const challenge = new TextDecoder().decode(
      base64url.decode(clientDataJSONObject.challenge)
    )
    const webauthnChallengeJwks = JSON.parse(
      context.env.SECRET_WEBAUTHN_SIGNING_KEY
    ) as KeyPairSerialized
    await verifySignedWebauthnChallenge(challenge, webauthnChallengeJwks)

    const passportUrl = new URL(request.url)

    const f2l = new Fido2Lib({
      timeout: 42,
      rpId: passportUrl.hostname,
      rpName: 'Rollup ID',
      challengeSize: 64,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })

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
        origin: passportUrl.origin,
        challenge: clientDataJSONObject.challenge,
        factor: 'first',
      }
    )

    const webauthnData = {
      counter: registrationResults.authnrData.get('counter'),
      publicKey: registrationResults.authnrData.get('credentialPublicKeyPem'),
    }

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(
        WebauthnAccountType.WebAuthN,
        registrationPayload.credentialId
      ),
      { node_type: NodeType.WebAuthN, addr_type: WebauthnAccountType.WebAuthN },
      { alias: registrationPayload.credentialId }
    )

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
  const { registrationOptions } = useLoaderData()
  if (
    registrationOptions?.challenge &&
    typeof registrationOptions.challenge === 'string'
  ) {
    registrationOptions.challenge = new TextEncoder().encode(
      registrationOptions.challenge
    )
  }

  const submit = useSubmit()
  const [requestedRegistration, setRequestedRegistration] = useState(false)
  const [keyName, setKeyName] = useState('')

  const randomBuffer = new Uint8Array(32)
  crypto.getRandomValues(randomBuffer)
  const registerKey = async (name: string) => {
    registrationOptions.user = {
      id: new TextEncoder().encode(base64url.encode(randomBuffer)),
      name,
      displayName: name,
    }
    let credential = await navigator.credentials.create({
      publicKey: registrationOptions,
    })
    if (
      credential instanceof PublicKeyCredential &&
      credential.response instanceof AuthenticatorAttestationResponse
    ) {
      const submitPayload = new FormData()
      submitPayload.set('credentialId', credential.id)
      submitPayload.set(
        'clientDataJSON',
        base64url.encode(new Uint8Array(credential.response.clientDataJSON))
      )
      submitPayload.set(
        'attestationObject',
        base64url.encode(new Uint8Array(credential.response.attestationObject))
      )
      submitPayload.set('nickname', name)
      submitPayload.set(
        'rawId',
        base64url.encode(new Uint8Array(credential.rawId))
      )
      submit(submitPayload, { method: 'post' })
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
            Connect with Passkey
          </Text>
        </section>
        <section className="flex-1">
          <Input
            type="text"
            id="webauthn_nickname"
            label="Name your Passkey"
            className="h-12 rounded-lg"
            onChange={(e) => setKeyName(e.target.value)}
            skin={true}
            autoFocus
          />
          <label>
            <Text size="sm" weight="medium" className="text-gray-400 my-2">
              Name must be at least 4 characters long
            </Text>
          </label>
          <Button
            type="submit"
            btnSize="xl"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setRequestedRegistration(true)
            }}
            className="w-full mt-4"
            disabled={keyName.length < 4}
          >
            Create new Passkey
          </Button>
        </section>
      </Form>
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
