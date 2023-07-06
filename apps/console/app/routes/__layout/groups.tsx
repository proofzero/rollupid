import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import createAddressClient from '@proofzero/platform-clients/address'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { NO_OP_ADDRESS_PLACEHOLDER } from '@proofzero/platform/address/src/constants'
import { AddressURN } from '@proofzero/urns/address'
import { Outlet, useLoaderData } from '@remix-run/react'

type GroupMemberModel = {
  URN: AddressURN
  iconURL: string
  title: string
  address: string
  joinTimestamp: number
}

type GroupModel = {
  URN: string
  name: string
  members: GroupMemberModel[]
}

type GroupRootLoaderData = {
  groups: GroupModel[]
}

export type GroupRootContextData = GroupRootLoaderData

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

    const addressClient = createAddressClient(Address, {
      [PlatformAddressURNHeader]: NO_OP_ADDRESS_PLACEHOLDER,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await accountClient.listIdentityGroups.query({
      accountURN,
    })

    const mappedGroups = []
    for (const group of groups) {
      const memberMap = group.members
        .filter((m) => m.joinTimestamp != null)
        .reduce(
          (acc, curr) => ({ ...acc, [curr.URN]: curr }),
          {} as Record<AddressURN, { URN: AddressURN; joinTimestamp: number }>
        )

      const memberProfiles = await addressClient.getAddressProfileBatch.query(
        group.members.map((m) => m.URN)
      )

      const memberModels: GroupMemberModel[] = memberProfiles.map(
        (profile) => ({
          URN: profile.id,
          iconURL: profile.icon!,
          title: profile.title,
          address: profile.address,
          joinTimestamp: memberMap[profile.id].joinTimestamp,
        })
      )

      mappedGroups.push({
        URN: group.URN,
        name: group.name,
        members: memberModels,
      })
    }

    return json<GroupRootLoaderData>({
      groups: mappedGroups,
    })
  }
)

export default () => {
  const data = useLoaderData<GroupRootLoaderData>()

  return <Outlet context={data} />
}
