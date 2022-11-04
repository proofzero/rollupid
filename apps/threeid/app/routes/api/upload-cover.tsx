import { ActionFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import { Visibility } from '~/utils/galaxy.server'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  let cfUploadUrlRes: {
    id: string
    uploadURL: string
  }

  try {
    // TODO: Replace with service binding
    cfUploadUrlRes = await fetch('https://icons.kubelt.com').then((res) =>
      res.json()
    )
  } catch (ex) {
    return json('Unable to generate upload URL', {
      status: 500,
    })
  }

  let cfUploadRes: {
    success: boolean
    result: {
      variants: string[]
    }
  }

  try {
    cfUploadRes = await fetch(cfUploadUrlRes.uploadURL, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())
  } catch (ex) {
    return json('Unable to upload image', {
      status: 500,
    })
  }

  // Assuming public variant is the intended one for now
  const publicVariantUrls = cfUploadRes.result.variants.filter((v) =>
    v.endsWith('public')
  )

  if (publicVariantUrls.length === 0) {
    return json('Unable to locate public variant', {
      status: 500,
    })
  }

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
