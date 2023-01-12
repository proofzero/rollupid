import { useOutletContext } from '@remix-run/react'

import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'
import { Profile } from '@kubelt/galaxy-client'

const EthProfileCollections = () => {
  const { profile, pfp } = useOutletContext<{
    profile: Profile
    pfp: string
  }>()

  const tempTargetAddress = profile?.addresses?.map(
    (n) => (n.qc as { alias: string }).alias
  )[0]

  return (
    <ProfileNftCollections
      account={tempTargetAddress} // TODO: make into list of addresses
      pfp={pfp}
      displayname={profile.displayName}
      filters={true}
      detailsModal
    />
  )
}

export default EthProfileCollections
