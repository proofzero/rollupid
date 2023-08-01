import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  IdentityGroupURNSpace,
  type IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { CryptoAddressType } from '@proofzero/types/address'
import _ from 'lodash'
import { getUserSession } from '~/session.server'

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

    let jwt = await getUserSession(request, context.env)
    if (jwt) {
      return redirect(
        `${context.env.CONSOLE_APP_URL}/groups/enroll/${groupID}/${invitationCode}`
      )
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
      default:
        login_hint = invDetails.addressType
    }

    const qp = new URLSearchParams()

    if (login_hint) {
      qp.append('login_hint', login_hint)
    }

    qp.append('client_id', 'passport')
    qp.append('redirect_uri', new URL(request.url).toString())
    qp.append('state', 'skip')
    qp.append('scope', '')
    qp.append('rollup_action', `group_${groupID}_${invitationCode}`)

    return redirect(`/authorize?${qp.toString()}`)
  }
)
