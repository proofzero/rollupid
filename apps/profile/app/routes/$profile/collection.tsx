import NftGrid from '~/components/nft-collection/NftGrid'
import { useRouteData } from '~/hooks'

import { mergeSortedNfts } from '~/helpers/nfts'

import { useState, useEffect, useMemo } from 'react'

import { useFetcher } from '@remix-run/react'

export type ProfileData = {
  targetAddress: string
  displayName: string
  isOwner: boolean
  pfp: {
    image: string
    isToken: string
  }
}

const ProfileRoute = () => {
  const { targetAddress, displayName, isOwner, pfp } =
    useRouteData<ProfileData>('routes/$profile')

  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()

  const getMoreNfts = async () => {
    const request = `/nfts?owner=${targetAddress}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }`
    fetcher.load(request)
  }
  /** HOOKS */
  useEffect(() => {
    if (fetcher.data) {
      /* We already have only 1 NFT per collection
       ** No need to put it in additional set
       */

      setLoadedNfts(mergeSortedNfts(loadedNfts, fetcher.data.ownedNfts))
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

  useMemo(() => {
    setRefresh(true)
    setLoadedNfts([])
    setPageLink(undefined)
  }, [])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }
    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  return (
    <NftGrid
      loadingConditions={loading || refresh}
      nfts={loadedNfts}
      account={targetAddress}
      pfp={pfp.image}
      isOwner={isOwner}
      filters={true}
      displaytext={`Looks like ${
        displayName ?? targetAddress
      } doesn't own any NFTs`}
      detailsModal
    />
  )
}

export default ProfileRoute
