import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import Masonry from 'react-masonry-css'

import { HiArrowNarrowLeft } from 'react-icons/hi'

import { Link } from '@remix-run/react'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import LoadingGrid from './NftGrid'
import ShowPartners from './ShowPartners'
import ModaledNft from './ModaledNft'

export type ProfileNftSingleCollectionProps = {
  account: string
  displayname?: string
  nfts?: {
    url: string
    title: string
    collectionTitle: string
  }[]
  isModal: boolean
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean
  collection: string

  handleSelectedNft?: (nft: any) => void
  setCollection?: (collection: string) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid: JSX.Element
}

const ProfileNftSingleCollection = ({
  nfts = [],
  isModal = false,
  isOwner = true,
  account,
  setCollection,
  displayname,
  preload = false,
  handleSelectedNft,
  collection = '',
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={true} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: ProfileNftSingleCollectionProps) => {
  const [refresh, setRefresh] = useState(true)

  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [selectedNft, setSelectedNft] = useState('')

  const getMoreNfts = async () => {
    const request = `/nfts/collection?owner=${account}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }&collection=${collection}`

    const nftReq: any = await fetch(request)
    const nftRes: any = await nftReq.json()

    // Do not need to sort them alphabetically here
    setLoadedNfts([...loadedNfts, ...nftRes.ownedNfts])
    setPageLink(nftRes.pageKey ?? null)

    if (refresh) {
      setRefresh(false)
    }
  }

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
  }, [account])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  return (
    <div className="mt-9">
      {!loading && !refresh && !isOwner && !loadedNfts.length && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && !refresh && isOwner && !loadedNfts.length && (
        <ShowPartners />
      )}

      {loadedNfts.length > 0 && (
        <>
          {/**
           * This "isModal" variable is reffering to gallery
           *  or settings/profile where this whole component is
           *  opened in the modal. When collection sets to empty
           *  string it switches this modal to show all collections.
           */}

          {isModal ? (
            <button
              onClick={() => {
                setCollection('')
              }}
            >
              <Text
                className="mb-12 text-gray-600"
                size="base"
                weight="semibold"
              >
                {loadedNfts[0].collectionTitle?.length ? (
                  <div>
                    <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                    {loadedNfts[0].collectionTitle}
                  </div>
                ) : (
                  <Text
                    className="mb-12 text-gray-600"
                    size="base"
                    weight="semibold"
                  >
                    <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                    Back to collections
                  </Text>
                )}
              </Text>
            </button>
          ) : (
            <Link to={`/${account}/collection`}>
              <Text
                className="mb-12 text-gray-600"
                size="base"
                weight="semibold"
              >
                {loadedNfts[0].collectionTitle?.length ? (
                  <div>
                    <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                    {loadedNfts[0].collectionTitle}
                  </div>
                ) : (
                  <Text
                    className="mb-12 text-gray-600"
                    size="base"
                    weight="semibold"
                  >
                    <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                    Back to collections
                  </Text>
                )}
              </Text>
            </Link>
          )}
          <InfiniteScroll
            dataLength={loadedNfts.length} //This is important field to render the next data
            next={preload ? () => {} : getMoreNfts}
            hasMore={preload ? false : pageKey != null}
            loader={<Spinner />}
          >
            <Masonry
              breakpointCols={{
                default: 5,
                1024: 3,
                768: 2,
                640: 1,
              }}
              className="flex w-auto"
              columnClassName="bg-clip-padding"
            >
              {loadedNfts.map((nft, i) => (
                // Filtering collection by
                // unique values
                // breaks the infinite scroll
                // plugin I resorted to this
                <div
                  key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                  className="flex
                        justify-center
                        w-[95%]
                        pl-[5%]
                        sm:pl-[10%]
                        sm:w-[90%]
                        mb-10"
                >
                  {nftRenderer(
                    nft,
                    selectedNft ===
                      `${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`,
                    (selectedNft: any) => {
                      setSelectedNft(
                        `${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`
                      )

                      if (handleSelectedNft) {
                        handleSelectedNft(selectedNft)
                      }
                    }
                  )}
                </div>
              ))}
            </Masonry>
          </InfiniteScroll>
        </>
      )}
      {(refresh || loading) && nftGrid}
    </div>
  )
}

export default ProfileNftSingleCollection
