import type { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const connectionsData = formData.get('connections')
  const connections = JSON.parse(connectionsData as string) as {
    addressURN: AddressURN
    public?: boolean
  }[]

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateConnectedAddressesProperties(
    {
      addressURNList: connections,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return null
}
