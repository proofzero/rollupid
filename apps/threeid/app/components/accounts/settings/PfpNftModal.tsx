import Modal from "~/components/modal/Modal";
import ProfileNftCollection from "~/components/profile/ProfileNftCollection";

type PfpNftModalProps = {
  account: string;
};

const PfpNftModal = ({ account }: PfpNftModalProps) => {
  return (
    <Modal isOpen={true}>
      <ProfileNftCollection account={account} />
    </Modal>
  );
};

export default PfpNftModal;
