import FilteredNftGrid from '~/components/nfts/grid/filtered'
import { mergeSortedNfts } from '~/helpers/nfts'
import { useState, useEffect, useMemo } from 'react'

import type { Node, Profile } from '@kubelt/galaxy-client'
import { useFetcher, useOutletContext, useNavigate } from '@remix-run/react'
import { getMoreNftsAllCollections } from '~/helpers/nfts'

const ProfileRoute = () => {
  const { profile, cryptoAddresses, isOwner, accountURN } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
    accountURN: string
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const targetAddresses = cryptoAddresses?.map((a) => a.qc.alias)

  const { displayName, pfp } = profile

  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()
  const navigate = useNavigate()

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
      getMoreNftsAllCollections(fetcher, accountURN, pageKey)
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
      getMoreNftsAllCollections(fetcher, accountURN, pageKey)
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
      pfp={(pfp as any).image as string}
      isOwner={isOwner}
      filters={true}
      displayText={`Looks like ${
        displayName ?? targetAddresses[0]
      } doesn't own any NFTs`}
      detailsModal
    />
  )
}

export default ProfileRoute
