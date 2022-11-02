import Modal from "~/components/modal/Modal";
import ProfileNftCollection from "~/components/profile/ProfileNftCollection";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

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
      <>
        <Text
          className="pb-1"
          size={TextSize.XL2}
          weight={TextWeight.Bold700}
          color={TextColor.Gray800}
        >
          Select NFT Avatar
        </Text>

        <ProfileNftCollection
          account={account}
          preload={true}
          filters
          handleSelectedNft={handleSelectedNft}
        />
      </>
    </Modal>
  );
};

export default PfpNftModal;
