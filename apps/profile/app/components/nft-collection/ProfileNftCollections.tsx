import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { mergeSortedNfts } from '~/helpers/nfts'

import Masonry from 'react-masonry-css'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import { useFetcher } from '@remix-run/react'

import LoadingGrid from './NftGrid'
import ShowPartners from './ShowPartners'
import ModaledNft from './ModaledNft'
import CollectionFilter from './CollectionFilter'

export type ProfileNftCollectionsProps = {
  account: string
  displayname?: string
  nfts?: {
    url: string
    title: string
    collectionTitle: string
  }[]
  pfp: string
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean
  filters?: boolean

  handleSelectedNft?: (nft: any) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid?: JSX.Element
}

const ProfileNftCollections = ({
  nfts = [],
  isOwner = true,
  account,
  displayname,
  preload = false,
  filters = false,
  handleSelectedNft,
  pfp,
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={false} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: ProfileNftCollectionsProps) => {
  const [refresh, setRefresh] = useState(true)

  const fetcher = useFetcher()

  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [openedFilters, setOpenedFilters] = useState(false)

  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')

  const [colFilters, setColFilters] = useState([
    { title: 'All Collections', img: undefined },
    { title: 'Untitled Collections', img: undefined },
  ])

  const [selectedNft, setSelectedNft] = useState('')

  const getMoreNfts = async () => {
    const request = `/nfts?owner=${account}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }`

    fetcher.load(request)
  }

  useEffect(() => {
    if (fetcher.data) {
      /* We already have only 1 NFT per collection
       ** No need to put it in additional set
       */
      setColFilters([
        ...colFilters,
        ...fetcher.data.ownedNfts.reduce((acc: any, nft: any) => {
          if (
            nft.collectionTitle &&
            nft.collectionTitle !== 'All Collections' &&
            nft.collectionTitle !== 'Untitled Collections'
          ) {
            return [
              ...acc,
              {
                title: nft.collectionTitle,
                img: nft.thumbnailUrl ? nft.thumbnailUrl : undefined,
              },
            ]
          } else {
            return acc
          }
        }, []),
      ])

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
  }, [account])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  const filteredLoadedNfts = loadedNfts.filter(
    (nft) =>
      curFilter === 'All Collections' ||
      curFilter === nft.collectionTitle ||
      (!nft.collectionTitle && curFilter === 'Untitled Collections')
  )

  return (
    <>
      {!loading && !refresh && !isOwner && !loadedNfts.length && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && !refresh && isOwner && !loadedNfts.length && (
        <ShowPartners />
      )}

      {/* If we browse all collections of a user */}
      {filters && loadedNfts.length > 0 && (
        <>
          <CollectionFilter
            colFilters={colFilters}
            setCurFilter={setCurFilter}
            curFilter={curFilter}
            openedFilters={openedFilters}
            setOpenedFilters={setOpenedFilters}
            setTextFilter={setTextFilter}
            textFilter={textFilter}
            pfp={pfp}
          />

          <InfiniteScroll
            dataLength={loadedNfts.length} //This is important field to render the next data
            next={preload ? () => {} : getMoreNfts}
            hasMore={preload ? false : pageKey != null}
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
              {filteredLoadedNfts.map((nft, index) => {
                return (
                  <div
                    key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`}
                    className="flex
                      justify-center
                      min-w-full
                      mb-10"
                  >
                    {nftRenderer(
                      nft,
                      selectedNft ===
                        `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`,
                      (selectedNft: any) => {
                        setSelectedNft(
                          `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`
                        )

                        if (handleSelectedNft) {
                          handleSelectedNft(selectedNft)
                        }
                      }
                    )}
                  </div>
                )
              })}
            </Masonry>
          </InfiniteScroll>
        </>
      )}

      {(refresh || loading) && nftGrid}
    </>
  )
}

export default ProfileNftCollections
