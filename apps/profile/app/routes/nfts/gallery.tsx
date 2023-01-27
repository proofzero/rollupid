import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalleryWithMetadata } from '~/helpers/nfts'
import { getProfileSession } from '~/utils/session.server'

export const loader: LoaderFunction = async (args) => {
  const srcUrl = new URL(args.request.url)

  const session = await getProfileSession(args.request)
  const user = session.get('user')

  const jwt = user.accessToken

  /**
   * params.profile is called from `$profile/gallery` route
   * searchParams - from `account/gallery?owner=0x123..`
   */
  const owner = srcUrl.searchParams.get('owner') || args.params.profile
  const { gallery } = await getGalleryWithMetadata(owner as string, jwt)

  return json({
    gallery,
  })
}
