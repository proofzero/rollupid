import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { GetIdentityGroupOutput } from '@proofzero/platform/account/src/jsonrpc/methods/identity-groups/getIdentityGroup'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  groupDetails: GetIdentityGroupOutput
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupID = `${['urn:rollupid:identity-group', params.groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(groupID)) {
      throw new Error('Invalid group ID')
    }

    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groupDetails = await accountClient.getIdentityGroup.query({
      identityGroupURN: groupID,
    })

    return json<LoaderData>({
      groupDetails,
    })
  }
)

export default () => {
  const { groupDetails } = useLoaderData<LoaderData>()

  return <>Name: {groupDetails.name}</>
}
