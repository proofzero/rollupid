import { Outlet, useLoaderData } from '@remix-run/react'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { ListIdentityGroupsOutput } from '@proofzero/platform/account/src/jsonrpc/methods/identity-groups/listIdentityGroups'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await coreClient.account.listIdentityGroups.query()
    if (groups.length === 0) {
      return redirect('/billing/personal')
    }

    return json({
      groups,
    })
  }
)

export default () => {
  const { groups } = useLoaderData<{ groups: ListIdentityGroupsOutput }>()

  return (
    <Outlet
      context={{
        groups,
      }}
    />
  )
}
