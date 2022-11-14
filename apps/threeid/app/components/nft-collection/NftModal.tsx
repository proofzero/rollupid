import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import Modal from '~/components/modal/Modal'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { useState } from 'react'

const NftModal = ({
  isOpen,
  nft,
  handleClose,
}: {
  isOpen: boolean
  nft: any
  handleClose: (evt: any) => void
}) => {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col lg:flex-row max-w-full">
        <div className="max-w-full lg:max-w-sm flex justify-center items-center">
          {!imgLoaded && (
            <div className="w-[24rem] h-[24rem] bg-gray-100 rounded-lg animate-pulse"></div>
          )}

          <img
            className={`object-cover rounded-lg ${
              imgLoaded ? 'visible' : 'invisible absolute w-3 h-3'
            }`}
            src={gatewayFromIpfs(nft?.url)}
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        <div className="p-0 lg:p-4 max-w-full lg:max-w-md mt-3">
          <Text
            className="mb-2"
            size={TextSize.LG}
            weight={TextWeight.Medium500}
            color={TextColor.Gray900}
          >
            {nft?.collectionTitle}
          </Text>
          <Text
            className="mb-5 lg:mb-10"
            size={TextSize.XL4}
            weight={TextWeight.SemiBold600}
            color={TextColor.Gray900}
          >
            {nft?.title}
          </Text>

          <hr />

          {nft?.properties?.length > 0 && (
            <div className="mt-4 lg:mt-8">
              <Text
                className="ml-1 mb-4"
                size={TextSize.LG}
                weight={TextWeight.SemiBold600}
                color={TextColor.Gray900}
              >
                Properties
              </Text>

              <div className="flex flex-row max-w-md flex-wrap overflow-hidden">
                {nft?.properties.map(
                  (p: { name: string; value: any; display: string }) => (
                    <div
                      key={p.name ?? `${new Date().getTime()}`}
                      className="m-1 py-2 px-4 border rounded-md"
                    >
                      <Text
                        size={TextSize.XS}
                        weight={TextWeight.Medium500}
                        color={TextColor.Gray400}
                      >
                        {p.name?.toUpperCase()}
                      </Text>
                      <Text
                        size={TextSize.SM}
                        weight={TextWeight.SemiBold600}
                        color={TextColor.Gray700}
                      >
                        {p.value}
                      </Text>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default NftModal
