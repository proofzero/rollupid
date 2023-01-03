import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'
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
const ProfileRoute = () => {
  const { targetAddress, displayName, isOwner, pfp } =
    useRouteData<ProfileData>('routes/$profile')

  return (
    <>
      <Text className="mb-8 lg:mb-12 text-gray-600" size="sm" weight="semibold">
        NFT Collections
      </Text>

      <ProfileNftCollections
        account={targetAddress}
        pfp={pfp.image}
        displayname={displayName}
        isOwner={isOwner}
        filters={true}
        detailsModal
      />
    </>
  )
}

export default ProfileRoute
