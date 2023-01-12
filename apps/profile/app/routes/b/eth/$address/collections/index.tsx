import { useOutletContext } from '@remix-run/react'
import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'

const EthProfileCollections = () => {
  const { profile, pfp } = useOutletContext<{
    profile: { displayName: string; address: string }
    pfp: string
  }>()

  return (
    <ProfileNftCollections
      account={profile.address}
      pfp={pfp}
      displayname={profile.displayName || profile.address}
      filters={true}
      detailsModal
    />
  )
}

export default EthProfileCollections
