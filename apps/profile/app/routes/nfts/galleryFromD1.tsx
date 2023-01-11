import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { AddressURNSpace } from '@kubelt/urns/address'
import { getIndexerClient } from '~/helpers/clients'

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

  const profile: any = owner

  const indexerClient = getIndexerClient()

  const urn: any = AddressURNSpace.urn(profile)
  const { gallery }: any = await indexerClient.getGallery.query([urn])
  return json({ gallery })
}
