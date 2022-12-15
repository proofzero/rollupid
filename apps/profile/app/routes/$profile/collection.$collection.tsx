import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { useRouteData } from '~/hooks'
import ProfileNftSingleCollection from '~/components/nft-collection/ProfileNftSingleCollection'

import type { ProfileData } from './collection'

export const loader: LoaderFunction = async (args) => {
  const { params } = args

  return json({
    collection: params.collection,
  })
}

const CollectionForProfileRoute = () => {
  const { collection } = useLoaderData()
  const { targetAddress, displayName, isOwner } =
    useRouteData<ProfileData>('routes/$profile')

  return (
    <>
      <Text className="mb-8 lg:mb-12 text-gray-600" size="sm" weight="semibold">
        NFT Collections
      </Text>

      <ProfileNftSingleCollection
        account={targetAddress}
        displayname={displayName}
        isOwner={isOwner}
        detailsModal
        collection={collection}
      />
    </>
  )
}

export default CollectionForProfileRoute
