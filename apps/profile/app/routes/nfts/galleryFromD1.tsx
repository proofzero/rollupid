import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGallery } from '~/helpers/nfts'

export const loader: LoaderFunction = async ({ request, params }) => {
  const srcUrl = new URL(request.url)
  /**
   * params.profile is called from `$profile/gallery` route
   * searchParams - from `account/gallery?owner=0x123..`
   */
  const owner = srcUrl.searchParams.get('owner') || params.profile
  if (!owner) {
    throw new Error('Owner required')
  }

  const gallery = getGallery(owner)
  return json({ gallery })
}
