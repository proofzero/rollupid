import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const id = formData.get('id') as string
  const name = formData.get('name') as string

  const galaxyClient = await getGalaxyClient()
  galaxyClient.updateAddressNickname(
    {
      addressURN: id,
      nickname: name,
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  return redirect('/account/settings/connections')
}
