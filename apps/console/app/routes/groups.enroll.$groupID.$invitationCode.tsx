import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json, redirect } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  IdentityGroupURNSpace,
  type IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { CryptoAddressType, EmailAddressType } from '@proofzero/types/address'

import { useLoaderData } from '@remix-run/react'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import { requireJWT } from '~/utilities/session.server'
import { AccountURN } from '@proofzero/urns/account'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Button } from '@proofzero/design-system'
import _ from 'lodash'

enum EnrollmentType {
  Own,
  Other,
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const groupID = params.groupID
    if (!groupID || groupID === '') {
      throw new BadRequestError({
        message: 'Missing group',
      })
    }

    const identityGroupURN = `${['urn:rollupid:identity-group', groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(identityGroupURN)) {
      throw new Error('Invalid group ID')
    }

    const invitationCode = params.invitationCode
    if (!invitationCode || invitationCode === '') {
      throw new BadRequestError({
        message: 'Missing invitation code',
      })
    }

    const jwt = await requireJWT(request, context.env)

    let accountURN: AccountURN | undefined
    if (jwt) {
      const parsedJwt = parseJwt(jwt)
      accountURN = parsedJwt.sub as AccountURN
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const invDetails =
      await coreClient.account.getIdentityGroupMemberInvitationDetails.query({
        invitationCode,
        identityGroupURN,
      })

    let login_hint = undefined
    switch (invDetails.addressType) {
      case CryptoAddressType.ETH:
        login_hint = 'wallet'
        break
      case EmailAddressType.Email:
        login_hint = 'email microsoft google apple'
        break
      default:
        login_hint = invDetails.addressType
    }

    if (!accountURN) {
      const qp = new URLSearchParams()

      if (login_hint) {
        qp.append('login_hint', login_hint)
      }

      qp.append('clientId', 'passport')
      qp.append('redirectUri', new URL(request.url).toString())
      qp.append('state', 'skip')
      qp.append('scope', '')

      const redirectURL = new URL(
        `${context.env.PASSPORT_URL}/authorize?${qp.toString()}`
      )

      return redirect(redirectURL.toString())
    }

    const accountAddresses = await coreClient.account.getOwnAddresses.query({
      account: accountURN,
    })
    const invitedAddress = accountAddresses.find(
      (aa) =>
        aa.qc.alias === invDetails.identifier &&
        aa.rc.addr_type === invDetails.addressType
    )

    return json({
      groupName: invDetails.identityGroupName,
      identifier: invDetails.identifier,
      addressType: invDetails.addressType,
      enrollmentType: invitedAddress
        ? EnrollmentType.Own
        : EnrollmentType.Other,
      loginHint: login_hint,
      passportURL: context.env.PASSPORT_URL,
    })
  }
)

export default () => {
  const {
    groupName,
    identifier,
    addressType,
    enrollmentType,
    loginHint,
    passportURL,
  } = useLoaderData<{
    groupName: string
    identifier: string
    addressType: string
    enrollmentType: EnrollmentType
    loginHint?: string
    passportURL: string
  }>()

  const redirectToPassport = () => {
    const currentURL = new URL(window.location.href)
    currentURL.search = ''

    const qp = new URLSearchParams()
    qp.append('scope', '')
    qp.append('state', 'skip')
    qp.append('client_id', 'console')

    qp.append('redirect_uri', currentURL.toString())
    qp.append('rollup_action', 'connect')
    if (loginHint) {
      qp.append('login_hint', loginHint)
    }

    window.location.href = `${passportURL}/authorize?${qp.toString()}`
  }

  return (
    <div
      className={`flex flex-row h-[100dvh] justify-center items-center bg-[#F9FAFB] dark:bg-gray-900`}
    >
      <div
        className={
          'basis-2/5 h-[100dvh] w-full hidden 2xl:flex justify-center items-center bg-indigo-50 dark:bg-[#1F2937] overflow-hidden'
        }
        style={{
          backgroundImage: `url(${sideGraphics})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      <div
        className={
          'basis-full basis-full 2xl:basis-3/5 flex flex-col justify-center items-center'
        }
      >
        <div className="bg-white rounded rounded-lg border">
          {enrollmentType === EnrollmentType.Own && (
            <>
              <Text>“User” has invited you to join "{groupName}"</Text>
              <Text>
                To get started continue with button below and select an account
                to authenticate.
              </Text>

              <section className="flex flex-row justify-end gap-2">
                <Button>Accept</Button>
                <Button>Deny</Button>
              </section>
            </>
          )}
          {enrollmentType === EnrollmentType.Other && (
            <>
              <Text>Cannot accept Invite to join "{groupName}"</Text>
              <Text>
                Your account identifier didn't match the invitation record. To
                proceed please connect the following account: <br />
                {_.upperFirst(addressType)} Account: {identifier}
              </Text>

              <Button
                btnType="secondary-alt"
                onClick={() => redirectToPassport()}
              >
                Connect Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
