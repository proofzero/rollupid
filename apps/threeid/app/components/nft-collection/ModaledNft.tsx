import { useState } from 'react'

import NftModal from './NftModal'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'

import missingNftSvg from '~/assets/missing-nft.svg'

const ModaledNft = ({ nft }: any) => {
  const [showModal, setShowModal] = useState(false)

  const [loadFail, setLoadFail] = useState(false)

  return (
    <>
      <NftModal
        nft={nft}
        isOpen={showModal}
        handleClose={() => setShowModal(false)}
      />

      <div className="relative overlay-img-wrapper cursor-pointer">
        <div
          onClick={() => {
            if (!loadFail) {
              setShowModal(true)
            }
          }}
          className="absolute left-0 right-0 top-0 bottom-0 p-1 lg:p-4 flex flex-col justify-end transition-all duration-300 rounded-lg"
        >
          <Text size="sm" weight="semibold" className="text-white">
            {nft.collectionTitle}
          </Text>
          <Text size="sm" weight="semibold" className="text-white">
            {nft.title}
          </Text>
        </div>

        <img
          className="w-full rounded-lg"
          src={
            loadFail
              ? missingNftSvg
              : gatewayFromIpfs(nft.thumbnailUrl ?? nft.url)
          }
          onError={(e) => setLoadFail(true)}
        />
      </div>
    </>
  )
}

export default ModaledNft
