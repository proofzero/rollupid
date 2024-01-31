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

    const references = await coreClient.account.getAccountReferenceTypes.query()
    const mappedReferences: AccountUsageDisconnectModel[] = references.map(
      (u: ReferenceType) => {
        switch (u) {
          case ReferenceType.Authorization:
            return {
              message: 'Account is being used for app(s) authorizations.',
              external: false,
              path: '/settings/applications',
            }
          case ReferenceType.DevNotificationsEmail:
            return {
              message:
                'Account is being used as contact in the Developer Console.',
              external: true,
              path: `${context.env.CONSOLE_APP_URL}`,
            }
          case ReferenceType.BillingEmail:
            return {
              message: 'Account is being used as billing email.',
              external: true,
              path: `${context.env.CONSOLE_APP_URL}/billing`,
            }
          default:
            throw new BadRequestError({
              message: `Unknown account reference type: ${u}`,
            })
        }
      }
    )

    return mappedReferences
  }
)
