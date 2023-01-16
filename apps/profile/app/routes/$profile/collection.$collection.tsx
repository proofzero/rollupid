import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { useState, useEffect, useMemo } from 'react'

import { useFetcher } from '@remix-run/react'

import { useRouteData } from '~/hooks'
import NftGrid from '~/components/nft-collection/NftGrid'

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
  /** STATE */
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()
  const navigate = useNavigate()

  const getMoreNfts = () => {
    const request = `/nfts/collection?owner=${targetAddress}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }&collection=${collection}`

    fetcher.load(request)
  }
  /** HOOKS */
  useEffect(() => {
    if (fetcher.data) {
      // Do not need to sort them alphabetically here
      setLoadedNfts([...loadedNfts, ...fetcher.data.ownedNfts])
      setPageLink(fetcher.data.pageKey ?? null)

      if (refresh) {
        setRefresh(false)
      }
    }
  }, [fetcher.data])

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNfts()
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  useMemo(() => {
    setRefresh(true)
    setLoadedNfts([])
    setPageLink(undefined)
  }, [])

  return (
    <NftGrid
      nfts={loadedNfts}
      isModal={false}
      handleRedirect={() => {
        navigate(`/${targetAddress}/collection`, { replace: true })
      }}
      loadingConditions={loading || refresh}
      account={targetAddress}
      isModalNft={true}
      isOwner={isOwner}
      displayText={`Looks like ${
        displayName ?? targetAddress
      } doesn't own any NFTs`}
      detailsModal
      filters={false}
      collection={collection}
    />
  )
}

export default CollectionForProfileRoute
