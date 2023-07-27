import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  IdentityGroupURNSpace,
  type IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

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

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const invDetails =
      await coreClient.account.getIdentityGroupmemberInvitationDetails.query({
        invitationCode,
        identityGroupURN,
      })

    const qp = new URLSearchParams()

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

    if (login_hint) {
      qp.append('login_hint', login_hint)
    }

    return json({
      invDetails,
      login_hint,
    })
  }
)
