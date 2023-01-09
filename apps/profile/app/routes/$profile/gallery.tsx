import ProfileNftGallery from '~/components/nft-collection/ProfileNftGallery'
import { useRouteData } from '~/hooks'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { loader as galleryLoader } from '~/routes/nfts/galleryFromD1'

export type ProfileData = {
  targetAddress: string
  displayName: string
  isOwner: boolean
  pfp: {
    image: string
    isToken: string
  }
}

export type GalleryData = {
  gallery: any[]
}

export const loader: LoaderFunction = async (args) => {
  const { params } = args
  const { gallery } = await (await galleryLoader(args)).json()
  if (!gallery || !gallery.length)
    return redirect(`/${params.profile}/collection`)
  return null
}

const ProfileRoute = () => {
  const { targetAddress, displayName, isOwner, pfp } =
    useRouteData<ProfileData>('routes/$profile')

  return (
    <>
      <ProfileNftGallery
        account={targetAddress}
        displayname={displayName}
        isOwner={isOwner}
        detailsModal
      />
    </>
  )
}

export default ProfileRoute
