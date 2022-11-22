import Modal from '~/components/modal/Modal'
import ProfileNftCollection from '~/components/nft-collection/ProfileNftCollection'
import SelectableNft from '~/components/nft-collection/SelectableNft'

import { Text } from '@kubelt/design-system'

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
      <>
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
      </>
    </Modal>
  )
}

export default PfpNftModal
