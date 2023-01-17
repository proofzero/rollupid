import { Node } from '@kubelt/galaxy-client'
import { useOutletContext } from '@remix-run/react'
import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'

const EthProfileCollections = () => {
  const { profile, pfp, cryptoAddresses, uname } = useOutletContext<{
    profile: { displayName: string }
    pfp: string
    cryptoAddresses: Node[]
    uname: string
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.urn)[0]

  return (
    <ProfileNftCollections
      account={tempTargetAddress}
      pfp={pfp}
      displayname={profile.displayName || uname}
      filters={true}
      detailsModal
    />
  )
}

export default EthProfileCollections
