import UnfilteredNftGrid from '~/components/nfts/grid/unfiltered'

import { useOutletContext } from '@remix-run/react'
import type { AccountURN } from '@proofzero/urns/account'
import type { FullProfile } from '~/types'

const ProfileRoute = () => {
  const { profile, isOwner } = useOutletContext<{
    profile: FullProfile
    isOwner: boolean
    accountURN: AccountURN
  }>()

  const { displayName, pfp } = profile
  /** STATE */

  return (
    <>
      <UnfilteredNftGrid
        nfts={profile.gallery}
        displayText={`Looks like ${
          isOwner ? 'you have' : `${displayName} has`
        } not curated a gallery`}
        filters={true}
        pfp={(pfp as any).image as string}
        loadingConditions={false}
        isModalNft={true}
        isModal={false}
        detailsModal
      />
    </>
  )
}

export default ProfileRoute
