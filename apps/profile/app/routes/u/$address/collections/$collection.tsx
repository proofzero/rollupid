import { Node } from '@kubelt/galaxy-client'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import ProfileNftSingleCollection from '~/components/nft-collection/ProfileNftSingleCollection'

export const loader: LoaderFunction = async (args) => {
  const { params } = args

  return json({
    collection: params.collection,
  })
}

const CollectionForProfileRoute = () => {
  const { collection } = useLoaderData()
  const { profile, cryptoAddresses, uname } = useOutletContext<{
    profile: { displayName: string }
    cryptoAddresses: Node[]
    uname: string
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.urn)[0]

  return (
    <>
      <ProfileNftSingleCollection
        account={tempTargetAddress}
        displayname={profile.displayName || tempTargetAddress}
        detailsModal
        collection={collection}
        backLink={`/u/${uname}/collections`}
      />
    </>
  )
}

export default CollectionForProfileRoute
