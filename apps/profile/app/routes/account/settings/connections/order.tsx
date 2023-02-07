import { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { ActionFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const connectionsText = formData.get('connections')
  const connections = JSON.parse(connectionsText as string) as {
    addressURN: AddressURN
    public?: boolean
  }[]
  console.debug({ connections })

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateAddressEdges(
    {
      addressURNList: connections,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  // const galaxyClient = await getGalaxyClient()
  // galaxyClient.updateAddressNickname(
  //   {
  //     addressURN: id,
  //     nickname: name,
  //   },
  //   getAuthzHeaderConditionallyFromToken(jwt)
  // )

  return null
}
