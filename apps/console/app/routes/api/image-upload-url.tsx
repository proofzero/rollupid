import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'
import { requireJWT } from '~/utilities/session.server'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)
  const data = await request.formData()
  const appURN = data.get('appURN') as string
  console.debug('BEFORE CHECK')
  if (!appURN || !ApplicationURNSpace.is(appURN))
    throw new Error('No ApplicationURN was provided in the request')
  console.debug('AFTER CHECK')

  const imageClient = createImageClient(Images)
  try {
    const { uploadURL } = await imageClient.getOneTimeImageUploadURL.query({
      entity: appURN as ApplicationURN,
    })
    return json(uploadURL)
  } catch (ex) {
    console.error(ex)
    return null
  }
}
