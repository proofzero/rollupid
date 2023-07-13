import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupID = params.groupID as string
    const groupURN = `${['urn:rollupid:identity-group', groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(groupURN)) {
      throw new Error('Invalid group ID')
    }

    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const addressType = fd.get('addressType') as
      | (EmailAddressType | OAuthAddressType | CryptoAddressType)
      | undefined
    if (!addressType) {
      throw new BadRequestError({
        message: 'Type is required',
      })
    }

    const identifier = fd.get('identifier') as string | undefined
    if (!identifier) {
      throw new BadRequestError({
        message: 'Identifier is required',
      })
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    await coreClient.account.inviteIdentityGroupMember.mutate({
      identifier,
      addressType: addressType,
      identityGroupURN: groupURN,
    })

    return redirect(`/groups/${groupID}`)
  }
)
