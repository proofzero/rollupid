import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import type { AddressURN } from '@kubelt/urns/address'
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
    profile: { handle: string; addresses: AddressURN[] }
  }>()

  return (
    <>
      <ProfileNftSingleCollection
        account={profile.addresses[0]}
        displayname={profile.handle}
        detailsModal
        collection={collection}
        backLink={`/u/${profile.handle}/collections`}
      />
    </>
  )
}

export default CollectionForProfileRoute
