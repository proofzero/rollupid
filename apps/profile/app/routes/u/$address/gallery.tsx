import FilteredNftGrid from '~/components/nft-collection/FilteredNftGrid'
import { useState, useEffect, useMemo } from 'react'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import type { Node, Profile } from '@kubelt/galaxy-client'

import { getGallery } from '~/helpers/nfts'
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
  const { profile, cryptoAddresses, isOwner } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.urn)[0]

  const { displayName, pfp } = profile
  /** STATE */
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()

  const getGallery = async () => {
    const request = `/nfts/gallery?owner=${targetAddress}`
    fetcher.load(request)
  }
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
      getGallery()
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
