import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { NO_OP_ADDRESS_PLACEHOLDER } from '@proofzero/platform/address/src/constants'
import { AddressURNSpace } from '@proofzero/urns/address'
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { Toaster, toast } from '@proofzero/design-system/src/atoms/toast'
import { ToastModel, getToastsAndFlashSession } from '~/utils/toast.server'
import { useEffect } from 'react'

type GroupMemberModel = {
  URN: AccountURN
  iconURL: string
  title: string
  address?: string
  joinTimestamp: number
}

export type GroupModel = {
  URN: string
  name: string
  members: GroupMemberModel[]
}

type GroupRootLoaderData = {
  groups: GroupModel[]
  CONSOLE_URL: string
  PASSPORT_URL: string
}

export type GroupRootContextData = GroupRootLoaderData & {
  accountURN: AccountURN
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      [PlatformAddressURNHeader]: NO_OP_ADDRESS_PLACEHOLDER,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await coreClient.account.listIdentityGroups.query()

    const mappedGroups = await Promise.all(
      groups.map(async (group) => {
        const memberMap = group.members
          .filter((m) => m.joinTimestamp != null)
          .reduce(
            (acc, curr) => ({ ...acc, [curr.URN]: curr }),
            {} as Record<AccountURN, { URN: AccountURN; joinTimestamp: number }>
          )

        const memberProfiles = await coreClient.account.getProfileBatch.query(
          group.members.map((m) => m.URN)
        )

        const memberModels: GroupMemberModel[] = memberProfiles
          .filter((mp) => Boolean(mp.profile))
          .map(({ profile, URN }) => ({
            URN: URN,
            iconURL: profile!.pfp!.image,
            title: profile!.displayName,
            address: profile!.primaryAddressURN
              ? profile!.addresses.find(
                  (a) =>
                    a.baseUrn ===
                    AddressURNSpace.getBaseURN(profile!.primaryAddressURN!)
                )?.qc.alias
              : undefined,
            joinTimestamp: memberMap[URN].joinTimestamp,
          }))

        return {
          URN: group.URN,
          name: group.name,
          members: memberModels,
        }
      })
    )

    const { flashSession, toasts } = await getToastsAndFlashSession(
      request,
      context.env
    )

    return json<
      GroupRootLoaderData & {
        toasts: ToastModel[]
      }
    >(
      {
        groups: mappedGroups,
        CONSOLE_URL: context.env.CONSOLE_URL,
        PASSPORT_URL: context.env.PASSPORT_URL,
        toasts,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)

export default () => {
  const data = useLoaderData<
    GroupRootLoaderData & {
      toasts: ToastModel[]
    }
  >()

  const { accountURN } = useOutletContext<{
    accountURN: AccountURN
  }>()

  useEffect(() => {
    const toasts = data.toasts

    if (!toasts || !toasts.length) return

    for (const { type, message } of toasts) {
      toast(type, {
        message: message,
      })
    }
  }, [data.toasts])

  return (
    <>
      <Toaster position="top-right" />
      <Outlet
        context={{
          accountURN,
          ...data,
        }}
      />
    </>
  )
}
