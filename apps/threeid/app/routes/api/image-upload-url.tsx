import { ActionFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)

  const galaxyClient = await getGalaxyClient()
  const { imageUploadUrl } = await galaxyClient.getImageUploadUrl()

  return json(imageUploadUrl)
}
