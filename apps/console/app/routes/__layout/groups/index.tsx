import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction, json } from '@remix-run/cloudflare'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { ListIdentityGroupsOutput } from '@proofzero/platform/account/src/jsonrpc/methods/identity-groups/listIdentityGroups'
import { Form, useLoaderData } from '@remix-run/react'
import { BadRequestError } from '@proofzero/errors'

type LoaderData = {
  groups: ListIdentityGroupsOutput
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await accountClient.listIdentityGroups.query({
      accountURN,
    })

    console.log({
      groups,
    })

    return json<LoaderData>({
      groups,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const name = fd.get('name')
    if (!name) {
      throw new BadRequestError({
        message: 'Name is required',
      })
    }

    await accountClient.createIdentityGroup.mutate({
      accountURN,
      name: name as string,
    })

    return null
  }
)

export default () => {
  const { groups } = useLoaderData<LoaderData>()

  return (
    <>
      <section>
        <Form method="post" action="/groups">
          <input type="text" name="name" />
          <button type="submit">Create Group</button>
        </Form>
      </section>

      <section>
        <ul>
          {groups.map((group) => (
            <li key={group.URN}>{group.name}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
