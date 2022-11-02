import Modal from "~/components/modal/Modal";
import ProfileNftCollection from "~/components/profile/ProfileNftCollection";

type PfpNftModalProps = {
  account: string;
};

const PfpNftModal = ({ account }: PfpNftModalProps) => {
  return (
    <Modal isOpen={true} fixed>
      <ProfileNftCollection account={account} preload={true} />
    </Modal>
  );
};

export default PfpNftModal;
