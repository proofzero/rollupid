import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import type { ClientOptions } from '@kubelt/platform-clients/types'

import CFImageUploadClient from '@kubelt/platform-clients/cf-image-upload'

import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const imagesClient = createImageClient(Images, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })

  const uploadURL = await imagesClient.upload.mutate()
  return json(uploadURL)
}
