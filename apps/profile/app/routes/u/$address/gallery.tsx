import ProfileNftGallery from '~/components/nft-collection/ProfileNftGallery'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { getGallery, getGalleryWithMetadata } from '~/helpers/nfts'
import { useOutletContext } from '@remix-run/react'
import { Node, Profile } from '@kubelt/galaxy-client'

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
  const { address } = params
  const { gallery } = await getGalleryWithMetadata(address as string)
  if (!gallery || !gallery.length) return redirect(`/u/${address}/collection`)
  return null
}

const ProfileGallery = () => {
  const { profile, cryptoAddresses } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.urn)[0]

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
