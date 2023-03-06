import type { AccountURN } from '@kubelt/urns/account'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getGallery } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const srcUrl = new URL(args.request.url)

  /**
   * params.profile is called from `$profile/gallery` route
   * searchParams - from `account/gallery?owner=0x123..`
   */

  const accountURN = srcUrl.searchParams.get('accountURN')

<<<<<<< HEAD
  const { gallery } = await getGalleryWithMetadata(
    accountURN as AccountURN,
    args.context.traceSpan
  )
=======
  const { gallery } = await getGallery(accountURN as AccountURN)
>>>>>>> 0b8da695 (wip)

  return json({
    gallery,
  })
}
