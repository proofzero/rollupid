import ProfileNftGallery from '~/components/nft-collection/ProfileNftGallery'
import { useRouteData } from '~/hooks'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { getGallery, getGalleryWithMetadata } from '~/helpers/nfts'

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
  const profile = args.params.profile as string
  const { gallery } = await getGalleryWithMetadata(profile)
  if (!gallery || !gallery.length) return redirect(`/${profile}/collection`)
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
