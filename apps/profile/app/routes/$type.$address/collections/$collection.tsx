import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useFetcher,
} from '@remix-run/react'
import { useState, useEffect, useMemo } from 'react'

import type { Profile } from '@kubelt/galaxy-client'

import UnfilteredNftGrid from '~/components/nfts/grid/unfiltered'
import { getMoreNftsSingleCollection } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const { params } = args

  return json({
    collection: params.collection,
  })
}

const CollectionForProfileRoute = () => {
  const { collection } = useLoaderData()
  const { profile, isOwner, accountURN } = useOutletContext<{
    profile: Profile
    isOwner: boolean
    accountURN: string
  }>()

  const { displayName } = profile

  /** STATE */
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()
  const navigate = useNavigate()

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
      getMoreNftsSingleCollection(fetcher, accountURN, collection, pageKey)
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useEffect(() => {
    const asyncFn = async () => {
      getMoreNftsSingleCollection(fetcher, accountURN, collection, pageKey)
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
    <UnfilteredNftGrid
      nfts={loadedNfts}
      isModal={false}
      handleRedirect={() => {
        navigate(`/u/${cryptoAddresses[0].nss.split('/')[1]}/collections`, {
          replace: true,
        })
      }}
      loadingConditions={loading || refresh}
      isModalNft={true}
      isOwner={isOwner}
      displayText={`Looks like ${displayName} doesn't own any NFTs`}
      detailsModal
      filters={false}
      collection={collection}
    />
  )
}

export default CollectionForProfileRoute
