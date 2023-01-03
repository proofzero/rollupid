import ProfileNftGallery from '~/components/nft-collection/ProfileNftGallery'
import { useRouteData } from '~/hooks'

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
