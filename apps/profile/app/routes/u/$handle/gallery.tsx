import ProfileNftGallery from '~/components/nft-collection/ProfileNftGallery'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { getGallery, getGalleryWithMetadata } from '~/helpers/nfts'
import { useOutletContext } from '@remix-run/react'
import { Profile } from '@kubelt/galaxy-client'

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

export const loader: LoaderFunction = async ({ params }) => {
  const { handle } = params
  const { gallery } = await getGalleryWithMetadata(handle as string)
  if (!gallery || !gallery.length) return redirect(`/u/${handle}/collection`)
  return null
}

const ProfileGallery = () => {
  const { profile } = useOutletContext<{
    profile: Profile
  }>()

  const tempTargetAddress = profile?.addresses?.map(
    (n) => (n.qc as { alias: string }).alias
  )[0]

  return (
    <>
      <ProfileNftGallery
        account={tempTargetAddress} // #TODO: replace with list of visible addresses
        displayname={profile.displayName as string}
        isOwner={true}
        detailsModal
      />
    </>
  )
}

export default ProfileGallery
