import type { AddressURN } from '@kubelt/urns/address'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGalleryWithMetadata } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const srcUrl = new URL(args.request.url)

  /**
   * params.profile is called from `$profile/gallery` route
   * searchParams - from `account/gallery?owner=0x123..`
   */
  const addressURN =
    srcUrl.searchParams.get('addressURN') || args.params.profile
  const { gallery } = await getGalleryWithMetadata(addressURN as AddressURN)

  return json({
    gallery,
  })
}
