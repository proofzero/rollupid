import FilteredNftGrid from '~/components/nfts/grid/filtered'
import { mergeSortedNfts } from '~/helpers/nfts'
import { useState, useEffect, useMemo } from 'react'

import type { Node, Profile } from '@kubelt/galaxy-client'
import { useFetcher, useOutletContext, useNavigate } from '@remix-run/react'

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
  const { profile, cryptoAddresses, isOwner } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.qc.alias)[0]

  const { displayName, pfp } = profile

  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()
  const navigate = useNavigate()

  const getMoreNfts = () => {
    const request = `/nfts?owner=${tempTargetAddress}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }`
    fetcher.load(request)
  }

  const handleRedirect = (collection: string) => {
    return navigate(`./${collection}`)
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
    <FilteredNftGrid
      handleSelectedNft={(nft) => {
        handleRedirect(nft.contract.address)
      }}
      isModal={false}
      loadingConditions={loading || refresh}
      nfts={loadedNfts}
      account={tempTargetAddress}
      pfp={(pfp as any).image as string}
      isOwner={isOwner}
      filters={true}
      displayText={`Looks like ${
        displayName ?? tempTargetAddress
      } doesn't own any NFTs`}
      detailsModal
    />
  )
}

export default ProfileRoute
