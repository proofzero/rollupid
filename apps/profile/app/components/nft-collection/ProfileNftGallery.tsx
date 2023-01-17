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

export type ProfileNftGalleryProps = {
  account: string
  displayname?: string
  nfts?: {
    url: string
    title: string
    collectionTitle: string
  }[]
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean

  handleSelectedNft?: (nft: any) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid?: JSX.Element
}

const ProfileNftGallery = ({
  nfts = [],
  isOwner = true,
  account,
  displayname,
  preload = false,
  handleSelectedNft,
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={true} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: ProfileNftGalleryProps) => {
  const [refresh, setRefresh] = useState(true)

  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [loading, setLoading] = useState(true)

  const [selectedNft, setSelectedNft] = useState('')

  const getGallery = async () => {
    const request = `/nfts/gallery?owner=${account}`

    const nftReq: any = await fetch(request)
    const nftRes: any = await nftReq.json()

    // Do not need to sort them alphabetically here
    setLoadedNfts([...loadedNfts, ...nftRes.gallery])

    if (refresh) {
      setRefresh(false)
    }
  }

  useEffect(() => {
    getGallery()
    setLoading(false)
  }, [])

  useMemo(() => {
    setRefresh(true)

    setLoadedNfts([])
  }, [account])

  useEffect(() => {
    const asyncFn = async () => {
      await getGallery()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  return (
    <div className="mt-9">
      {!loading && !refresh && !isOwner && !loadedNfts.length && (
        <Text
          className="text-center text-gray-300 pb-5"
          size="2xl"
          weight="medium"
        >
          Looks like {displayname ?? account} didn't set curated gallery
        </Text>
      )}
      {!loading && !refresh && isOwner && !loadedNfts.length && (
        <ShowPartners isGallery={true} />
      )}

      {loadedNfts.length > 0 && (
        <InfiniteScroll
          dataLength={loadedNfts.length} //This is important field to render the next data
          next={preload ? () => {} : getGallery}
          hasMore={preload ? false : loading}
          loader={<Spinner />}
        >
          <Masonry
            breakpointCols={{
              default: 5,
              1280: 4,
              1024: 3,
              768: 2,
              640: 1,
            }}
            className="flex 
              w-full
              space-x-[16px]
              px-3 lg:px-4"
            // conditional width
            columnClassName="bg-clip-padding 
              min-w-[calc(20%-12.8px)]
              max-[1280px]:min-w-[calc(25%-12px)]
              max-[1024px]:min-w-[calc(33.33333%-10.667px)]
              max-[768px]:min-w-[calc(50%-8px)]
              max-[640px]:min-w-full"
          >
            {loadedNfts.map((nft, i) => (
              <div
                key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                className="flex
                  justify-center
                  min-w-full
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
      )}
      {(refresh || loading) && nftGrid}
    </div>
  )
}

export default ProfileNftGallery
