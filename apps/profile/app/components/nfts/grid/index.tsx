import Masonry from 'react-masonry-css'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import LoadingGrid from './loading'
import { useState } from 'react'

export type NftGridProps = {
  nfts: any[]
  pfp?: string
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean

  filters?: boolean
  pageKey?: string
  loadingConditions: boolean
  collection?: string

  getMoreNfts?: () => void
  handleSelectedNft?: (nft: any) => void
  handleRedirect?: () => void
  setCollection?: (s: string) => void

  nftRenderer: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid?: JSX.Element
}

const NftGrid = ({
  nfts = [],
  loadingConditions,
  getMoreNfts,
  pageKey,
  preload = false,
  handleSelectedNft,
  nftRenderer,
  nftGrid = <LoadingGrid />,
}: NftGridProps) => {
  const [selectedNft, setSelectedNft] = useState('')
  return (
    <>
      {nfts.length ? (
        <>
          {/* GENERIC GRID FOR ALL NFT-RELATED COMPONENTS */}
          <InfiniteScroll
            dataLength={nfts.length}
            // This is important field to render the next data
            next={preload ? () => {} : (getMoreNfts as () => void)}
            hasMore={preload ? false : pageKey != null}
            loader={<Spinner />}
          >
            <Masonry
              breakpointCols={{
                default: 3,
              }}
              className="flex 
              w-full
              space-x-[16px]
              px-3 lg:px-4"
              /** Conditional width to keep
               *  spacing between nfts constant
               */
              columnClassName="bg-clip-padding 
              min-w-[calc(33.33333%-10.667)]
              "
            >
              {nfts.map((nft, index) => {
                return (
                  <div
                    key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`}
                    className="flex
                      justify-center
                      min-w-full
                      mb-6"
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
