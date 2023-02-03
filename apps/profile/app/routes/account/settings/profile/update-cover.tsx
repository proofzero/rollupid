import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { ActionFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()
  const coverUrl = formData.get('url') as string

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        cover: coverUrl,
      },
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return json(coverUrl)
}
