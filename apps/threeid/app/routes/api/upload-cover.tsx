import { ActionFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import { Visibility } from '~/utils/galaxy.server'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const cfUploadUrlRes: {
    id: string
    uploadURL: string
    // @ts-ignore
  } = await ICONS.fetch('http://127.0.0.1/').then((res) => res.json())

  const cfUploadRes: {
    success: boolean
    result: {
      variants: string[]
    }
  } = await fetch(cfUploadUrlRes.uploadURL, {
    method: 'POST',
    body: formData,
  }).then((res) => res.json())

  // Assuming public variant is the intended one for now
  const publicVariantUrls = cfUploadRes.result.variants.filter((v) =>
    v.endsWith('public')
  )

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        cover: publicVariantUrls[0],
      },
      visibility: Visibility.Public,
    },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )

  return json(publicVariantUrls[0])
}
