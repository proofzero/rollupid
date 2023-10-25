import { BadRequestError } from '@proofzero/errors'
import type { ActionFunction } from '@remix-run/cloudflare'

import { ReferenceType } from '@proofzero/platform.account/src/types'

import { AccountUsageDisconnectModel } from '~/components/settings/accounts/DisconnectModal'
import { getCoreClient } from '~/platform.server'
import {
  getDefaultAuthzParams,
  getValidatedSessionContext,
} from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { GetAccountLinksResult } from '@proofzero/platform/account/src/jsonrpc/methods/getAccountLinks'
import { CoreClientType } from '@proofzero/platform-clients/core'
import { IdentityURNSpace } from '@proofzero/urns/identity'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await getValidatedSessionContext(
      request,
      getDefaultAuthzParams(request),
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()
    const accountURN = formData.get('accountURN') as string
    const coreClient = getCoreClient({ context, accountURN })

    const links = await coreClient.account.getAccountLinks.query()
    const linksWithAuthorizedAppNames = await getLinksWithAuthorizedAppNames(
      coreClient,
      links
    )

    const mappedLinks: AccountUsageDisconnectModel[] =
      linksWithAuthorizedAppNames.map((link) => {
        switch (link.type) {
          case ReferenceType.Authorization:
            return {
              title: link.title,
              external: false,
              path: `/settings/applications/${link.identifier}`,
              type: link.type,
            }
          case ReferenceType.DevNotificationsEmail:
            return {
              title: link.title,
              external: true,
              path: `${context.env.CONSOLE_APP_URL}/apps/${link.identifier}/team`,
              type: link.type,
            }
          case ReferenceType.BillingEmail:
            return IdentityURNSpace.is(link.URN)
              ? {
                  title: 'Billing',
                  external: true,
                  path: `${context.env.CONSOLE_APP_URL}/billing`,
                  type: link.type,
                }
              : {
                  title: link.title,
                  external: true,
                  path: `${context.env.CONSOLE_APP_URL}/billing/groups/${link.identifier}}`,
                  type: link.type,
                }
          default:
            throw new BadRequestError({
              message: `Unknown account reference type: ${link.type}`,
            })
        }
      })

    return mappedLinks
  }
)

const getLinksWithAuthorizedAppNames = async (
  coreClient: CoreClientType,
  links: GetAccountLinksResult
) => {
  const authorizedApps = links
    .filter((l) => l.type === ReferenceType.Authorization)
    .map((l) => l.identifier)
  const authorizedIdentifiedApps = authorizedApps.filter((l) => !!l) as string[]

  if (authorizedApps.length !== authorizedIdentifiedApps.length) {
    console.warn(
      'Some authorized apps are not identified',
      authorizedApps,
      authorizedIdentifiedApps
    )
  }

  const authorizedAppNames = await coreClient.starbase.getAppNameBatch.query(
    authorizedIdentifiedApps
  )
  const authorizedAppNamesMap = authorizedAppNames
    .filter((a) => !!a.name)
    .reduce<{
      [key: string]: string
    }>((acc, curr) => {
      acc[curr.clientId] = curr.name!
      return acc
    }, {})

  const mappedLinks = links.map((l) => {
    if (l.type === ReferenceType.Authorization) {
      return {
        ...l,
        title: l.identifier && authorizedAppNamesMap[l.identifier],
      }
    }
    return l
  })

  return mappedLinks
}
