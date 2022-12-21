import ProfileNftCollection from '~/components/nft-collection/ProfileNftCollection'
import SelectableNft from '~/components/nft-collection/SelectableNft'

import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

type PfpNftModalProps = {
  account: string
  isOpen: boolean
  handleClose: (value: boolean) => void
  handleSelectedNft: (nft: any) => void
}

const PfpNftModal = ({
  account,
  isOpen,
  handleClose,
  handleSelectedNft,
}: PfpNftModalProps) => {
  return (
    <Modal isOpen={isOpen} fixed handleClose={handleClose}>
      <div className="flex-1 relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6 overflow-y-auto">
        <Text className="pb-1 text-gray-800" size="2xl" weight="bold">
          Select NFT Avatar
        </Text>

        <ProfileNftCollection
          account={account}
          preload={true}
          filters
          handleSelectedNft={handleSelectedNft}
          nftRenderer={(nft, selected, handleSelectedNft) => (
            <SelectableNft
              nft={nft}
              selected={selected}
              handleSelectedNft={handleSelectedNft}
            />
          )}
        />
      </div>
    </Modal>
  )
}

export default PfpNftModal
