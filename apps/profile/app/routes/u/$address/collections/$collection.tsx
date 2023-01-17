import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useFetcher,
} from '@remix-run/react'
import { useState, useEffect, useMemo } from 'react'

import type { Node, Profile } from '@kubelt/galaxy-client'

import UnfilteredNftGrid from '~/components/nfts/grid/unfiltered'

export const loader: LoaderFunction = async (args) => {
  const { params } = args

  return json({
    collection: params.collection,
  })
}

const CollectionForProfileRoute = () => {
  const { collection } = useLoaderData()
  const { profile, cryptoAddresses, isOwner } = useOutletContext<{
    profile: Profile
    cryptoAddresses: Node[]
    isOwner: boolean
  }>()

  // TODO: change the ProfileNFTGallery to take multiple addresses
  const tempTargetAddress = cryptoAddresses?.map((a) => a.qc.alias)[0]

  const { displayName } = profile

  /** STATE */
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const fetcher = useFetcher()
  const navigate = useNavigate()

  const getMoreNfts = () => {
    const request = `/nfts/collection?owner=${tempTargetAddress}${
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
    <UnfilteredNftGrid
      nfts={loadedNfts}
      isModal={false}
      handleRedirect={() => {
        navigate(`/u/${cryptoAddresses[0].nss.split('/')[1]}/collections`, {
          replace: true,
        })
      }}
      loadingConditions={loading || refresh}
      account={tempTargetAddress} // #TODO: replace with list of visible addresses
      isModalNft={true}
      isOwner={isOwner}
      displayText={`Looks like ${
        displayName ?? tempTargetAddress
      } doesn't own any NFTs`}
      detailsModal
      filters={false}
      collection={collection}
    />
  )
}

export default CollectionForProfileRoute
