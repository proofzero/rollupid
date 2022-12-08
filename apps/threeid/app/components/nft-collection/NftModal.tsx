import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
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
  console.log(nft)
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
            alt=""
          />
        </div>

        <div className="p-0 lg:p-4 max-w-full lg:max-w-md mt-3">
          <Text className="mb-2 text-gray-900" size="lg" weight="medium">
            {nft?.collectionTitle}
          </Text>
          <Text
            className="mb-5 lg:mb-10 text-gray-900"
            size="4xl"
            weight="semibold"
          >
            {nft?.title}
          </Text>

          <div className="accordion accordion-flush" id="accordionDetails">
            {typeof nft?.details === 'object' &&
              Object.keys(nft.details).length > 0 && (
                <div
                  className="accordion-item 
                border-t-0 border-l-0 border-r-0 
                rounded-none bg-white mt-4 lg:mt-8"
                >
                  <Text
                    className="accordion-header ml-1 mb-4 text-gray-900"
                    size="lg"
                    weight="semibold"
                    id="flush-headingOne"
                  >
                    <button
                      className={
                        'accordion-button relative flex\
                       items-center w-full py-4\
                      text-left bg-white border-0 rounded-none\
                       transition focus:outline-none'
                      }
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseOne"
                      aria-expanded="true"
                      aria-controls="flush-collapseOne"
                    >
                      Details
                    </button>
                  </Text>

                  <div
                    id="flush-collapseOne"
                    className="accordion-collapse border-0 collapse show
                     flex flex-column max-w-md  overflow-hidden"
                    aria-labelledby="flush-headingOne"
                    data-bs-parent="#accordionDetails"
                  >
                    <div className="accordion-body">
                      <div className="keys pr-8 ">
                        <Text
                          size="xs"
                          weight="medium"
                          className="text-gray-400 pb-2"
                        >
                          NFT Contract
                        </Text>

                        <Text
                          size="xs"
                          weight="medium"
                          className="text-gray-400 pb-2"
                        >
                          NFT Standard
                        </Text>
                      </div>
                      <div className="values">
                        <Text
                          size="sm"
                          weight="semibold"
                          className="text-gray-700 pt-2"
                        >
                          {nft.details.contractAddress}
                          <Text
                            size="sm"
                            weight="semibold"
                            className="text-gray-700 pt-6"
                          >
                            {nft.details.nftStandard}
                          </Text>
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <hr />
            {nft?.properties?.length > 0 && (
              <div
                className="accordion-item 
              border-t-0 border-l-0 border-r-0 
              rounded-none bg-white mt-4 lg:mt-8"
              >
                <Text
                  className="accordion-header 
                  ml-1 mb-4 text-gray-900"
                  size="lg"
                  weight="semibold"
                >
                  <button
                    className={
                      'accordion-button relative flex\
                       items-center w-full py-4\
                      text-left bg-white border-0 rounded-none\
                       transition focus:outline-none'
                    }
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseTwo"
                    aria-expanded="true"
                    aria-controls="flush-collapseTwo"
                  >
                    Properties
                  </button>
                </Text>

                <div
                  id="flush-collapseTwo"
                  className="accordion-collapse border-0 collapse show
                     flex flex-column max-w-md  overflow-hidden"
                  aria-labelledby="flush-headingTwo"
                  data-bs-parent="#accordionDetails"
                >
                  <div className="accordion-body">
                    {nft?.properties.map(
                      (p: { name: string; value: any; display: string }) => (
                        <div
                          key={p.name ?? `${new Date().getTime()}`}
                          className="m-1 py-2 px-4 border rounded-md"
                        >
                          <Text
                            size="xs"
                            weight="medium"
                            className="text-gray-400"
                          >
                            {p.name?.toUpperCase()}
                          </Text>
                          <Text
                            size="sm"
                            weight="semibold"
                            className="text-gray-700"
                          >
                            {p.value}
                          </Text>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default NftModal
