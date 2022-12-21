import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { useRouteData } from '~/hooks'
import ProfileNftOneCollection from '~/components/nft-collection/ProfileNftOneCollection'

import type { ProfileData } from './collection'

export const loader: LoaderFunction = async (args) => {
  console.log('here')
  const { params } = args

  return json({
    collection: params.collection,
  })
}

const CollectionForProfileRoute = () => {
  const { collection } = useLoaderData()
  console.log({ collection })
  const { targetAddress, displayName, isOwner } =
    useRouteData<ProfileData>('routes/$profile')

  return (
    <>
      <Text className="mb-8 lg:mb-12 text-gray-600" size="sm" weight="semibold">
        NFT Collections
      </Text>

      <ProfileNftOneCollection
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
