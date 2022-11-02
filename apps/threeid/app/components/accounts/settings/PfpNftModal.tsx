import Modal from "~/components/modal/Modal";
import ProfileNftCollection from "~/components/profile/ProfileNftCollection";

type PfpNftModalProps = {
  account: string;
  isOpen: boolean;
  handleClose: (value: boolean) => void;
  handleSelectedNft: (nft: any) => void;
};

const PfpNftModal = ({
  account,
  isOpen,
  handleClose,
  handleSelectedNft,
}: PfpNftModalProps) => {
  return (
    <Modal isOpen={isOpen} fixed handleClose={handleClose}>
      <ProfileNftCollection
        account={account}
        preload={true}
        filters
        handleSelectedNft={handleSelectedNft}
      />
    </Modal>
  );
};

export default PfpNftModal;
