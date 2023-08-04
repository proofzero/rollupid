import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  obfuscateAlias,
  parseJwt,
} from '@proofzero/utils'
import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import {
  IdentityGroupURNSpace,
  type IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { CryptoAddressType } from '@proofzero/types/address'

import { useLoaderData, useSubmit } from '@remix-run/react'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import { requireJWT } from '~/utilities/session.server'
import { AccountURN } from '@proofzero/urns/account'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Button } from '@proofzero/design-system'
import _ from 'lodash'

import danger from '~/images/danger.svg'

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

    const identityGroupURN = IdentityGroupURNSpace.urn(
      groupID
    ) as IdentityGroupURN

    const invitationCode = params.invitationCode
    if (!invitationCode || invitationCode === '') {
      throw new BadRequestError({
        message: 'Missing invitation code',
      })
    }

    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

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
      default:
        login_hint = invDetails.addressType
    }

    const accountAddresses = await coreClient.account.getOwnAddresses.query({
      account: accountURN,
    })
    const invitedAddress = accountAddresses.find(
      (aa) =>
        aa.qc.alias.toLowerCase() === invDetails.identifier.toLowerCase() &&
        aa.rc.addr_type === invDetails.addressType
    )

    return json({
      inviterAlias: invDetails.inviter,
      groupName: invDetails.identityGroupName,
      identifier: obfuscateAlias(invDetails.identifier, invDetails.addressType),
      addressType: invDetails.addressType,
      enrollmentType: invitedAddress
        ? EnrollmentType.Own
        : EnrollmentType.Other,
      loginHint: login_hint,
      passportURL: context.env.PASSPORT_URL,
      groupID: groupID,
      invitationCode: invitationCode,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const groupID = params.groupID
    if (!groupID || groupID === '') {
      throw new BadRequestError({
        message: 'Missing group',
      })
    }

    const identityGroupURN = IdentityGroupURNSpace.urn(
      groupID
    ) as IdentityGroupURN
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
    if (!jwt) {
      throw new UnauthorizedError({
        message: 'Missing JWT',
      })
    }

    const fd = await request.formData()
    const op = fd.get('op')
    if (op && op === 'deny') {
      return redirect(
        `${context.env.PASSPORT_URL}/settings/dashboard?toast=groupdeny`
      )
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    await coreClient.account.acceptIdentityGroupMemberInvitation.mutate({
      invitationCode,
      identityGroupURN,
    })

    return redirect(`/groups/${groupID}`)
  }
)

export default () => {
  const {
    inviterAlias,
    groupName,
    identifier,
    addressType,
    enrollmentType,
    loginHint,
    passportURL,
    groupID,
    invitationCode,
  } = useLoaderData<{
    inviterAlias: string
    groupName: string
    identifier: string
    addressType: string
    enrollmentType: EnrollmentType
    loginHint?: string
    passportURL: string
    groupID: string
    invitationCode: string
  }>()

  const redirectToPassport = () => {
    const currentURL = new URL(window.location.href)
    currentURL.search = ''

    const qp = new URLSearchParams()
    qp.append('scope', '')
    qp.append('state', 'skip')
    qp.append('client_id', 'console')

    qp.append('redirect_uri', currentURL.toString())
    qp.append('rollup_action', `groupconnect_${groupID}_${invitationCode}`)
    if (loginHint) {
      qp.append('login_hint', loginHint)
    }

    window.location.href = `${passportURL}/authorize?${qp.toString()}`
  }

  const submit = useSubmit()

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
        <div className="bg-white rounded rounded-lg border p-6 max-w-lg">
          {enrollmentType === EnrollmentType.Own && (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="127"
                height="30"
                viewBox="0 0 127 30"
                fill="none"
                className="mb-4"
              >
                <path
                  d="M42.4117 12.1422H40.3958C38.5415 12.1422 37.6143 13.5287 37.6143 16.3017V22.375H34.4756V9.51387H37.6143V11.785C37.9376 10.9684 38.3545 10.39 38.8648 10.0498C39.392 9.69249 40.0725 9.51387 40.9062 9.51387H42.4117V12.1422ZM54.6166 20.7163C53.3578 21.9582 51.7502 22.5792 49.7936 22.5792C47.8373 22.5792 46.2212 21.9582 44.9451 20.7163C43.6864 19.4575 43.057 17.8668 43.057 15.9445C43.057 14.0221 43.6864 12.44 44.9451 11.1981C46.2212 9.93918 47.8373 9.30973 49.7936 9.30973C51.7502 9.30973 53.3578 9.93918 54.6166 11.1981C55.8756 12.44 56.5049 14.0221 56.5049 15.9445C56.5049 17.8668 55.8756 19.4575 54.6166 20.7163ZM49.7936 19.8742C50.8485 19.8742 51.6991 19.5085 52.3456 18.777C53.0089 18.0454 53.3407 17.1013 53.3407 15.9445C53.3407 14.7876 53.0089 13.8434 52.3456 13.1119C51.6991 12.3804 50.8485 12.0146 49.7936 12.0146C48.7218 12.0146 47.8544 12.3804 47.1908 13.1119C46.5443 13.8434 46.2212 14.7876 46.2212 15.9445C46.2212 17.1013 46.5443 18.0454 47.1908 18.777C47.8544 19.5085 48.7218 19.8742 49.7936 19.8742ZM58.8017 22.375V4.00195H61.9151V22.375H58.8017ZM65.0816 22.375V4.00195H68.1948V22.375H65.0816ZM83.1255 9.51387V22.375H79.9866V20.3846C79.2382 21.8477 77.9026 22.5792 75.9802 22.5792C74.5342 22.5792 73.369 22.1113 72.4842 21.1757C71.6168 20.223 71.1828 18.9896 71.1828 17.4755V9.51387H74.3217V16.8121C74.3217 17.6967 74.5682 18.4197 75.0617 18.9811C75.5549 19.5255 76.2014 19.7977 77.0011 19.7977C77.8857 19.7977 78.6001 19.4915 79.1444 18.879C79.7059 18.2666 79.9866 17.484 79.9866 16.5314V9.51387H83.1255ZM86.1142 27.5806V9.51387H89.2273V11.1215C90.0779 9.91366 91.3709 9.30973 93.1062 9.30973C94.9435 9.30973 96.3979 9.92217 97.4697 11.147C98.5415 12.3549 99.0774 13.954 99.0774 15.9445C99.0774 17.9178 98.5075 19.517 97.3678 20.7419C96.2449 21.9667 94.7479 22.5792 92.8766 22.5792C92.094 22.5792 91.3796 22.4346 90.7331 22.1454C90.0866 21.8562 89.5847 21.4649 89.2273 20.9715V27.5806H86.1142ZM92.5193 19.8742C93.5571 19.8742 94.3905 19.517 95.0201 18.8025C95.6495 18.088 95.9642 17.1353 95.9642 15.9445C95.9642 14.7536 95.6495 13.8009 95.0201 13.0864C94.3905 12.3719 93.5571 12.0146 92.5193 12.0146C91.4646 12.0146 90.6138 12.3719 89.9676 13.0864C89.3379 13.8009 89.0233 14.7536 89.0233 15.9445C89.0233 17.1353 89.3379 18.088 89.9676 18.8025C90.6138 19.517 91.4646 19.8742 92.5193 19.8742ZM100.797 19.0577H104.191V22.375H100.797V19.0577ZM107.264 4.51232H110.632V7.62553H107.264V4.51232ZM107.392 22.375V9.51387H110.531V22.375H107.392ZM118.783 22.5792C116.878 22.5792 115.381 21.9752 114.292 20.7674C113.203 19.5425 112.659 17.9349 112.659 15.9445C112.659 13.954 113.203 12.3549 114.292 11.147C115.381 9.92217 116.861 9.30973 118.732 9.30973C120.416 9.30973 121.675 9.89665 122.509 11.0705V4.00195H125.622V22.375H122.509V20.7674C122.134 21.3288 121.616 21.7711 120.952 22.0943C120.289 22.4176 119.566 22.5792 118.783 22.5792ZM116.716 18.8025C117.345 19.517 118.188 19.8742 119.242 19.8742C120.297 19.8742 121.139 19.517 121.769 18.8025C122.398 18.088 122.713 17.1353 122.713 15.9445C122.713 14.7536 122.398 13.8009 121.769 13.0864C121.139 12.3719 120.297 12.0146 119.242 12.0146C118.188 12.0146 117.345 12.3719 116.716 13.0864C116.087 13.8009 115.772 14.7536 115.772 15.9445C115.772 17.1353 116.087 18.088 116.716 18.8025Z"
                  fill="#1F2937"
                />
                <path
                  d="M19.4838 26.2787C23.7689 24.3046 26.7433 19.9718 26.7433 14.9444C26.7433 8.05591 21.1591 2.47168 14.2706 2.47168C7.38209 2.47168 1.79785 8.05591 1.79785 14.9444C1.79785 19.4845 4.22359 23.458 7.84972 25.6397V14.8706L7.85012 14.871C7.88946 11.3587 10.7489 8.52353 14.2706 8.52353C17.8167 8.52353 20.6915 11.3983 20.6915 14.9444C20.6915 18.4901 17.8174 21.3646 14.2719 21.3653L19.4838 26.2787Z"
                  fill="#6366F1"
                />
              </svg>

              <Text className="mb-2">
                <Text weight="bold" type="span">
                  "{inviterAlias}"
                </Text>{' '}
                has invited you to join{' '}
                <Text weight="bold" type="span">
                  "{groupName}"
                </Text>
              </Text>

              <Text className="text-gray-500 mb-4">
                Continue by making a selection with the buttons below.
              </Text>

              <section className="flex flex-row justify-end gap-2">
                <Button
                  btnType="secondary-alt"
                  onClick={() => {
                    submit(
                      {
                        op: 'deny',
                      },
                      {
                        method: 'post',
                        action: `/groups/enroll/${groupID}/${invitationCode}`,
                      }
                    )
                  }}
                >
                  Cancel
                </Button>
                <Button
                  btnType="primary-alt"
                  onClick={() => {
                    submit(
                      {},
                      {
                        method: 'post',
                        action: `/groups/enroll/${groupID}/${invitationCode}`,
                      }
                    )
                  }}
                >
                  Accept
                </Button>
              </section>
            </>
          )}
          {enrollmentType === EnrollmentType.Other && (
            <>
              <img src={danger} className="mb-4" />

              <Text className="mb-2 truncate">
                <Text weight="bold" type="span">
                  Cannot accept
                </Text>{' '}
                Invite to join{' '}
                <Text weight="bold" type="span" className="truncate">
                  "{groupName}"
                </Text>
              </Text>

              <Text className="text-gray-500">
                Your account identifier didn't match the invitation record. To
                proceed please connect the following account:
              </Text>

              <Text weight="bold" className="text-orange-600 truncate mb-4">
                {_.upperFirst(addressType)} Account: {identifier}
              </Text>

              <Button
                btnType="primary-alt"
                onClick={() => redirectToPassport()}
                className="w-full"
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
