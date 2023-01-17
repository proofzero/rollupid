import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { HiArrowNarrowLeft } from 'react-icons/hi'
import { useEffect, useState } from 'react'
import LoadingGrid from '../loading'
import ShowPartners from '../../partners'
import NftGrid from '../../grid'
import ModaledNft from '../../interactible/modaled'

export type UnfilteredNftGridProps = {
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

const UnfilteredNftGrid = ({
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
  handleSelectedNft,
  handleRedirect,
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={isModalNft} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: UnfilteredNftGridProps) => {
  const [displayedNfts, setDisplayedNfts] = useState(nfts)
  useEffect(() => {
    setDisplayedNfts(nfts)
  }, [nfts])

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
      {displayedNfts.length && !loadingConditions ? (
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

          {/* GENERIC GRID FOR ALL NFT-RELATED COMPONENTS */}
          <NftGrid
            nfts={displayedNfts}
            loadingConditions={loadingConditions}
            account={account}
            getMoreNfts={getMoreNfts}
            pageKey={pageKey}
            isModalNft={isModalNft}
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

export default UnfilteredNftGrid
