import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalleryWithMetadata } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const srcUrl = new URL(args.request.url)
  /**
   * params.profile is called from `$profile/gallery` route
   * searchParams - from `account/gallery?owner=0x123..`
   */
  const owner = srcUrl.searchParams.get('owner') || args.params.profile
  console.log({ owner })
  const { gallery } = await getGalleryWithMetadata(owner as string)

  console.log({ gallery })
  return json({
    gallery,
  })
}
