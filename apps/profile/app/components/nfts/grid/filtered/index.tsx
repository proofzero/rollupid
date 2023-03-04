import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { useEffect, useState } from 'react'
import LoadingGrid from '../loading'
import NftGrid from '../'
import CollectionFilter from '../../filters'
import ModaledNft from '../../interactible/modaled'

export type FilteredNftGridProps = {
  nfts: any[]
  pfp?: string
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
  setCollection?: (s: string) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid?: JSX.Element
}

const FilteredNftGrid = ({
  nfts = [],
  loadingConditions,
  getMoreNfts,
  pageKey,
  displayText,
  isModalNft = false,
  preload = false,
  handleSelectedNft,
  pfp,
  nftRenderer = (nft, isSelected, handleRedirect) => (
    <ModaledNft
      nft={nft}
      isModal={isModalNft}
      handleRedirect={handleRedirect}
    />
  ),
  nftGrid = <LoadingGrid />,
}: FilteredNftGridProps) => {
  const [openedFilters, setOpenedFilters] = useState(false)
  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')
  const [colFilters, setColFilters] = useState([
    { title: 'All Collections', img: undefined },
    { title: 'Untitled Collections', img: undefined },
  ])
  const [displayedNfts, setDisplayedNfts] = useState(nfts)

  useEffect(() => {
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
  }, [nfts])

  useEffect(() => {
    setDisplayedNfts(
      nfts.filter(
        (nft) =>
          curFilter === 'All Collections' ||
          curFilter === nft.collectionTitle ||
          (!nft.collectionTitle && curFilter === 'Untitled Collections')
      )
    )
  }, [nfts, curFilter])

  useEffect(() => {
    setDisplayedNfts(nfts)
  }, [nfts])

  return (
    <>
      {!loadingConditions &&
        !displayedNfts.length &&
        curFilter !== 'Untitled Collections' && (
          <Text
            className="text-center text-gray-300"
            size="2xl"
            weight="medium"
          >
            {displayText}
          </Text>
        )}
      {/* If we browse all collections of a user */}
      {(displayedNfts.length && !loadingConditions) ||
      curFilter === 'Untitled Collections' ? (
        <>
          <div
            className="w-full flex items-center justify-start 
        sm:justify-end lg:justify-end my-5 px-3 lg:px-4"
          >
            <div className=" min-w-full sm:min-w-[17.2rem]">
              <CollectionFilter
                colFilters={colFilters}
                setCurFilter={setCurFilter}
                curFilter={curFilter}
                openedFilters={openedFilters}
                setOpenedFilters={setOpenedFilters}
                setTextFilter={setTextFilter}
                textFilter={textFilter}
                pfp={pfp as string}
              />
            </div>
          </div>

          {/* GENERIC GRID FOR ALL NFT-RELATED COMPONENTS */}
          <NftGrid
            nfts={displayedNfts}
            loadingConditions={loadingConditions}
            getMoreNfts={getMoreNfts}
            pageKey={pageKey}
            preload={preload}
            nftRenderer={nftRenderer}
            handleSelectedNft={handleSelectedNft}
          />
        </>
      ) : null}
      {loadingConditions && nftGrid}
    </>
  )
}

export default FilteredNftGrid
