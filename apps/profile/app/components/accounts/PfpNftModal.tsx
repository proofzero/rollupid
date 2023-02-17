import FilteredNftGrid from '~/components/nfts/grid/filtered'
import UnfilteredNftGrid from '~/components/nfts/grid/unfiltered'
import SelectableNft from '~/components/nfts/interactible'
import { LoadingGridSquares } from '~/components/nfts/grid/loading'

import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

type PfpNftModalProps = {
  text?: string
  nfts: any[]
  pfp: string
  displayName: string
  isOpen: boolean
  loadingConditions: boolean
  collection: string

  setCollection: (collection: string) => void
  handleClose: (value: boolean) => void
  handleSelectedNft: (nft: any) => void
}

const PfpNftModal = ({
  nfts,
  text,
  isOpen,
  pfp,
  loadingConditions,
  handleClose,
  displayName,
  handleSelectedNft,
  collection,
  setCollection,
}: PfpNftModalProps) => {
  const displayText = `Looks like ${displayName} doesn't own any NFTs`

  return (
    <Modal isOpen={isOpen} fixed handleClose={handleClose}>
      <div
        className="flex-1 relative transform rounded-lg bg-white 
        overflow-x-visible h-max w-screen min-[480px]:w-full px-2 pt-5 
      pb-4 text-left shadow-xl transition-all overflow-y-auto"
      >
        {text?.length && (
          <Text
            className="lg:px-4 px-3 pb-2 text-center
            text-gray-800"
            size="2xl"
            weight="bold"
          >
            {text}
          </Text>
        )}

        {collection.length ? (
          <UnfilteredNftGrid
            nfts={nfts}
            isModal={true}
            displayText={displayText}
            loadingConditions={loadingConditions}
            setCollection={setCollection}
            collection={collection}
            preload={true}
            handleSelectedNft={(nft) => {
              handleSelectedNft(nft)
            }}
            nftRenderer={(nft, selected, handleSelectedNft) => (
              <SelectableNft
                nft={nft}
                hovered={true}
                selected={selected}
                handleSelectedNft={(nft: any) => {
                  handleSelectedNft(nft)
                }}
              />
            )}
            nftGrid={<LoadingGridSquares numberOfCells={30} />}
          />
        ) : (
          <FilteredNftGrid
            nfts={nfts}
            preload={true}
            isModal={true}
            displayText={displayText}
            pfp={pfp}
            loadingConditions={loadingConditions}
            filters
            handleSelectedNft={(nft) => {
              setCollection(nft.contract.address)
            }}
            nftRenderer={(nft, selected, handleSelectedNft) => (
              <SelectableNft
                nft={nft}
                selected={selected}
                handleSelectedNft={(nft: any) => {
                  setCollection(nft.contract.address)
                }}
              />
            )}
            nftGrid={<LoadingGridSquares numberOfCells={30} />}
          />
        )}
      </div>
    </Modal>
  )
}

export default PfpNftModal
