import { useState } from 'react'

import NftModal from './NftModal'

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'

const ModaledNft = ({ nft }: any) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <NftModal
        nft={nft}
        isOpen={showModal}
        handleClose={() => setShowModal(false)}
      />

      <div className="relative overlay-img-wrapper">
        <div
          onClick={() => {
            setShowModal(true)
          }}
          className="absolute left-0 right-0 top-0 bottom-0 p-4 flex flex-col justify-end transition-all duration-300"
        >
          <Text
            size={TextSize.SM}
            weight={TextWeight.SemiBold600}
            color={TextColor.White}
          >
            {nft.collectionTitle}
          </Text>
          <Text
            size={TextSize.SM}
            weight={TextWeight.SemiBold600}
            color={TextColor.White}
          >
            {nft.title}
          </Text>
        </div>

        <img className="w-full" src={gatewayFromIpfs(nft.url)} />
      </div>
    </>
  )
}

export default ModaledNft
