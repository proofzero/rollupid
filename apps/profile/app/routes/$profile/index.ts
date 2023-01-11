import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { getGallery } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const profile = args.params.profile as string

  const gallery = await getGallery(profile)

  console.log('should redirect?', gallery)

  if (gallery.length) {
    return redirect(`/${profile}/gallery`)
  }

  return redirect(`/${profile}/collection`)
}
