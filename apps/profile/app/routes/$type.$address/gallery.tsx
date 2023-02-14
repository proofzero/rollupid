import FilteredNftGrid from '~/components/nfts/grid/filtered'
import { useState, useEffect, useMemo } from 'react'

import type { Node, Profile } from '@kubelt/galaxy-client'

import { getMoreNftsGallery } from '~/helpers/nfts'

import { useFetcher, useOutletContext } from '@remix-run/react'

const ProfileRoute = () => {
  const { profile, cryptoAddresses, isOwner, accountURN } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
    accountURN: string
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const targetAddresses = cryptoAddresses?.map((a) => a.urn)

  const { displayName, pfp } = profile
  /** STATE */
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()

  /** HOOKS */
  useEffect(() => {
    if (fetcher.data) {
      // Do not need to sort them alphabetically here
      setLoadedNfts([...loadedNfts, ...fetcher.data.gallery])

      if (refresh) {
        setRefresh(false)
      }
      setLoading(false)
    }
  }, [fetcher.data])

  useEffect(() => {
    const asyncFn = async () => {
      getMoreNftsGallery(fetcher, accountURN)
    }

    if (refresh) {
      asyncFn()
      setLoading(false)
    }
  }, [refresh])

  useMemo(() => {
    setRefresh(true)
    setLoadedNfts([])
  }, [])

  return (
    <>
      <FilteredNftGrid
        nfts={loadedNfts}
        isOwner={isOwner}
        displayText={`Looks like ${
          displayName ?? targetAddresses[0]
        } has not curated a gallery`}
        filters={true}
        pfp={(pfp as any).image as string}
        loadingConditions={loading || refresh}
        isModalNft={true}
        isModal={false}
        detailsModal
      />
    </>
  )
}

export default ProfileRoute
