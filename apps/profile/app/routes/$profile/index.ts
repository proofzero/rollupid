import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { loader as galleryLoader } from '~/routes/nfts/galleryFromD1'

export const loader: LoaderFunction = async (args) => {
  const { params } = args

  const { gallery } = await (await galleryLoader(args)).json()

  if (gallery.length) {
    return redirect(`/${params.profile}/gallery`)
  }

  return redirect(`/${params.profile}/collection`)
}
