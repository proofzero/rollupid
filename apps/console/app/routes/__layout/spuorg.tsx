import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { IdentityURN } from '@proofzero/urns/identity'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { PlatformAccountURNHeader } from '@proofzero/types/headers'
import { NO_OP_ACCOUNT_PLACEHOLDER } from '@proofzero/platform/account/src/constants'
import { AccountURNSpace } from '@proofzero/urns/account'
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { Toaster, toast } from '@proofzero/design-system/src/atoms/toast'
import { ToastModel, getToastsAndFlashSession } from '~/utils/toast.server'
import { useEffect } from 'react'
import { AppLoaderData } from '~/root'

type GroupMemberModel = {
  URN: IdentityURN
  iconURL: string
  title: string
  account?: string
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
  identityURN: IdentityURN
  apps: AppLoaderData[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      [PlatformAccountURNHeader]: NO_OP_ACCOUNT_PLACEHOLDER,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await coreClient.identity.listIdentityGroups.query()

    const mappedGroups = await Promise.all(
      groups.map(async (group) => {
        const memberMap = group.members
          .filter((m) => m.joinTimestamp != null)
          .reduce(
            (acc, curr) => ({ ...acc, [curr.URN]: curr }),
            {} as Record<
              IdentityURN,
              { URN: IdentityURN; joinTimestamp: number }
            >
          )

        const memberProfiles = await coreClient.identity.getProfileBatch.query(
          group.members.map((m) => m.URN)
        )

        const memberModels: GroupMemberModel[] = memberProfiles
          .filter((mp) => Boolean(mp.profile))
          .map(({ profile, URN }) => ({
            URN: URN,
            iconURL: profile!.pfp!.image,
            title: profile!.displayName,
            account: profile!.primaryAccountURN
              ? profile!.accounts.find(
                  (a) =>
                    a.baseUrn ===
                    AccountURNSpace.getBaseURN(profile!.primaryAccountURN!)
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
  const { apps, identityURN } = useOutletContext<{
    apps: AppLoaderData[]
    identityURN: IdentityURN
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
          identityURN,
          ...data,
          apps,
        }}
      />
    </>
  )
}
