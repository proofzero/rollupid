import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../../groups'

type LoaderData = {
  URN: IdentityGroupURN
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupID = `${['urn:rollupid:identity-group', params.groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(groupID)) {
      throw new Error('Invalid group ID')
    }

    return json<LoaderData>({
      URN: groupID,
    })
  }
)

export default () => {
  const { groups } = useOutletContext<GroupRootContextData>()
  const { URN } = useLoaderData<LoaderData>()

  const group = groups.find((group) => group.URN === URN)

  return (
    <>
      <section>Name: {group?.name}</section>
      <section>
        <ul>
          {group?.members.map((member) => (
            <li key={member.URN}>
              {member.title} - {member.address}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <pre>{JSON.stringify(group, null, 2)}</pre>
      </section>
    </>
  )
}
