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
  const { profile } = useOutletContext<{
    profile: { address: string; displayName: string }
  }>()

  return (
    <>
      <ProfileNftSingleCollection
        account={profile.address}
        displayname={profile.displayName || profile.address}
        detailsModal
        collection={collection}
        backLink={`/b/eth/${profile.address}/collections`}
      />
    </>
  )
}

export default CollectionForProfileRoute
