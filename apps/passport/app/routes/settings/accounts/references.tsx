import { BadRequestError } from '@proofzero/errors'
import { ReferenceType } from '@proofzero/platform.address/src/jsonrpc/methods/getAddressReferenceTypes'
import type { ActionFunction } from '@remix-run/cloudflare'
import { AddressUsageDisconnectModel } from '~/components/settings/accounts/DisconnectModal'
import { getAddressClient } from '~/platform.server'
import {
  getDefaultConsoleParams,
  getValidatedSessionContext,
} from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  await getValidatedSessionContext(
    request,
    getDefaultConsoleParams(request),
    context.env,
    context.traceSpan
  )

  const formData = await request.formData()
  const addressURN = formData.get('addressURN') as string
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )

  const references = await addressClient.getAddressReferenceTypes.query()
  const mappedReferences: AddressUsageDisconnectModel[] = references.map(
    (u: ReferenceType) => {
      switch (u) {
        case ReferenceType.Authorization:
          return {
            message: 'Address is being used for app(s) authorizations.',
            external: false,
            path: '/settings/applications',
          }
        case ReferenceType.DevNotificationsEmail:
          return {
            message:
              'Address is being used as contact in the Developer Console.',
            external: true,
            path: `${context.env.CONSOLE_APP_URL}`,
          }
        default:
          throw new BadRequestError({
            message: `Unknown address reference type: ${u}`,
          })
      }
    }
  )

  return mappedReferences
}