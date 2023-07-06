import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import createAddressClient from '@proofzero/platform-clients/address'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { useLoaderData } from '@remix-run/react'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { NO_OP_ADDRESS_PLACEHOLDER } from '@proofzero/platform/address/src/constants'
import { AddressURN } from '@proofzero/urns/address'

type MemberModel = {
  URN: AddressURN
  iconURL: string
  title: string
  address: string
  joinTimestamp: number
}

type LoaderData = {
  name: string
  members: MemberModel[]
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

    const addressClient = createAddressClient(Address, {
      [PlatformAddressURNHeader]: NO_OP_ADDRESS_PLACEHOLDER,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groupDetails = await accountClient.getIdentityGroup.query({
      identityGroupURN: groupID,
    })
    const memberMap = groupDetails.members
      .filter((m) => m.joinTimestamp != null)
      .reduce(
        (acc, curr) => ({ ...acc, [curr.URN]: curr }),
        {} as Record<AddressURN, { URN: AddressURN; joinTimestamp: number }>
      )

    const memberProfiles = await addressClient.getAddressProfileBatch.query(
      groupDetails.members.map((m) => m.URN)
    )

    const memberModels: MemberModel[] = memberProfiles.map((profile) => ({
      URN: profile.id,
      iconURL: profile.icon!,
      title: profile.title,
      address: profile.address,
      joinTimestamp: memberMap[profile.id].joinTimestamp,
    }))

    return json<LoaderData>({
      name: groupDetails.name,
      members: memberModels,
    })
  }
)

export default () => {
  const { name, members } = useLoaderData<LoaderData>()

  return (
    <>
      <section>Name: {name}</section>
      <section>
        <ul>
          {members.map((member) => (
            <li key={member.URN}>
              {member.title} - {member.address}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <pre>
          {JSON.stringify(
            {
              name,
              members,
            },
            null,
            2
          )}
        </pre>
      </section>
    </>
  )
}
