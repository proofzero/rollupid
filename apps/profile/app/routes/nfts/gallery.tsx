import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalleryWithMetadata } from '~/helpers/nfts'
import { getUserSession } from '~/utils/session.server'

export const loader: LoaderFunction = async (args) => {
  const srcUrl = new URL(args.request.url)

  const session = await getUserSession(args.request)
  const jwt = session.get('jwt')

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
