import FilteredNftGrid from '~/components/nfts/grid/filtered'
import { useState, useEffect, useMemo } from 'react'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import type { Node, Profile } from '@kubelt/galaxy-client'

import { getGallery, getMoreNftsGallery } from '~/helpers/nfts'

import { useFetcher, useOutletContext } from '@remix-run/react'

export type ProfileData = {
  targetAddress: string
  displayName: string
  isOwner: boolean
  pfp: {
    image: string
    isToken: string
  }
}

export type GalleryData = {
  gallery: any[]
}

export const loader: LoaderFunction = async (args) => {
  const profile = args.params.profile as string
  const gallery = await getGallery(profile)

  if (!gallery || !gallery.length) return redirect(`/${profile}/collection`)

  return null
}

const ProfileRoute = () => {
  const { profile, cryptoAddresses, isOwner, accountURN } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
    accountURN: string
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.urn)[0]

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
        account={tempTargetAddress}
        isOwner={isOwner}
        displayText={`Looks like ${
          displayName ?? tempTargetAddress
        } didn't set curated gallery`}
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
