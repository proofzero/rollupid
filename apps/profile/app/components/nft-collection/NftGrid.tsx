import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import Masonry from 'react-masonry-css'
import { HiArrowNarrowLeft } from 'react-icons/hi'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import LoadingGrid from './LoadingNftGrid'
import ShowPartners from './ShowPartners'
import ModaledNft from './ModaledNft'
import CollectionFilter from './CollectionFilter'

export type NftGridProps = {
  account: string
  nfts: any[]
  pfp?: string
  isOwner?: boolean
  displayText: string
  preload?: boolean
  detailsModal?: boolean

  filters?: boolean
  pageKey?: string
  isModal: boolean
  loadingConditions: boolean
  isModalNft?: boolean
  collection?: string

  getMoreNfts?: () => void
  handleSelectedNft?: (nft: any) => void
  handleRedirect?: () => void
  setCollection?: (s: string) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid?: JSX.Element
}

const NftGrid = ({
  nfts = [],
  loadingConditions,
  isOwner = true,
  account,
  getMoreNfts,
  pageKey,
  displayText,
  isModal = false,
  isModalNft = false,
  setCollection,
  preload = false,
  filters = false,
  handleSelectedNft,
  handleRedirect,
  pfp,
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={isModalNft} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: NftGridProps) => {
  /*
   *  STATE NEEDED ONLY FOR FILTERS
   *  FILTERS ARE USED ONLY WHEN DISPLAYING 'ALL COLLECTIONS'
   *
   * ----------- IN CASE FILTERS NEEDED BLOCK ----------------
   */
  const [openedFilters, setOpenedFilters] = useState(false)
  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')
  const [colFilters, setColFilters] = useState([
    { title: 'All Collections', img: undefined },
    { title: 'Untitled Collections', img: undefined },
  ])
  const [displayedNfts, setDisplayedNfts] = useState(nfts)

  useEffect(() => {
    if (filters) {
      setColFilters([
        ...colFilters,
        ...nfts.reduce((acc: any, nft: any) => {
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
    }
  }, [nfts, filters])

  useEffect(() => {
    if (filters) {
      setDisplayedNfts(
        nfts.filter(
          (nft) =>
            curFilter === 'All Collections' ||
            curFilter === nft.collectionTitle ||
            (!nft.collectionTitle && curFilter === 'Untitled Collections')
        )
      )
    }
  }, [nfts, filters, curFilter])
  // ----------- END OF THE FILTERS NEEDED BLOCK ---------------- //

  useEffect(() => {
    setDisplayedNfts(nfts)
  }, [nfts])

  const [selectedNft, setSelectedNft] = useState('')

  return (
    <>
      {!loadingConditions && !isOwner && !displayedNfts.length && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          {displayText}
        </Text>
      )}
      {!loadingConditions && !displayedNfts.length && isOwner && (
        <ShowPartners />
      )}
      {/* If we browse all collections of a user */}
      {displayedNfts.length ? (
        <>
          {/* Filters are only displayed for the component with all nfts */}
          {filters && (
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
          )}
          {/* When there are no filters - this means it's '$profile/gallery'
           or a single collection routes */}
          {!filters ? (
            <>
              {isModal ? (
                <button
                  onClick={() => {
                    ;(setCollection as (s: string) => void)('')
                  }}
                  className="lg:px-4 px-3"
                >
                  <Text
                    className="mt-9 mb-12 text-gray-600 "
                    size="base"
                    weight="semibold"
                  >
                    {displayedNfts[0].collectionTitle?.length ? (
                      <div>
                        <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                        {displayedNfts[0].collectionTitle}
                      </div>
                    ) : (
                      <Text
                        className="mt-9 mb-12 text-gray-600"
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
                <button
                  onClick={() => {
                    ;(handleRedirect as () => void)()
                  }}
                >
                  <Text
                    className="mt-9 mb-12 text-gray-600"
                    size="base"
                    weight="semibold"
                  >
                    {displayedNfts[0].collectionTitle?.length ? (
                      <div className="lg:px-4 px-3">
                        <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                        {displayedNfts[0].collectionTitle}
                      </div>
                    ) : (
                      <Text
                        className="mt-9 mb-12 text-gray-600"
                        size="base"
                        weight="semibold"
                      >
                        <HiArrowNarrowLeft className="inline mr-8"></HiArrowNarrowLeft>
                        Back to collections
                      </Text>
                    )}
                  </Text>
                </button>
              )}
            </>
          ) : null}

          {/* GENERIC GRID FOR ALL NFT-RELATED COMPONENTS */}
          <InfiniteScroll
            dataLength={displayedNfts.length} //This is important field to render the next data
            next={preload ? () => {} : (getMoreNfts as () => void)}
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
              /** Conditional width to keep
               *  spacing between nfts constant
               */
              columnClassName="bg-clip-padding 
              min-w-[calc(20%-12.8px)]
              max-[1280px]:min-w-[calc(25%-12px)]
              max-[1024px]:min-w-[calc(33.33333%-10.667px)]
              max-[768px]:min-w-[calc(50%-8px)]
              max-[640px]:min-w-full"
            >
              {displayedNfts.map((nft, index) => {
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
      ) : null}
      {loadingConditions && nftGrid}
    </>
  )
}

export default NftGrid
