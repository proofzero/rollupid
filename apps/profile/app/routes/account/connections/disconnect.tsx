import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'
import { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const id = formData.get('id') as AddressURN
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(context.traceSpan)
  )

  try {
    await galaxyClient.disconnectAddress(
      {
        addressURN: id,
      },
      getAuthzHeaderConditionallyFromToken(jwt)
    )
  } catch (ex) {
    console.error(ex)
  }

  return null
}
