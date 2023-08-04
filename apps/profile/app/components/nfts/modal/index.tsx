import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import { HiChevronDown, HiOutlineX } from 'react-icons/hi'

import { gatewayFromIpfs } from '@proofzero/utils'

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
  const [hover, setHover] = useState('')
  const [openedDetails, setOpenedDetails] = useState(
    nft?.properties?.length == 0
  )
  const [copied, setCopied] = useState(false)
  const [openedProps, setOpenedProps] = useState(nft?.properties?.length > 0)
  const noProps =
    nft?.properties?.length > 0 ? '' : 'items-center justify-center text-center'
  const noDetails =
    nft?.details?.length > 0 ? '' : 'items-center justify-center text-center'

  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div
        className={`flex-1 relative h-max w-full sm:min-w-[37rem] sm:max-h-[35rem] sm:max-w-[58rem] h-[86vh] sm:w-[62vw]
           bg-white rounded-lg p-4 thin-scrollbar
         text-left transition-all sm:p-6 overflow-y-auto`}
      >
        <div className="flex flex-col justify-between lg:flex-row max-w-full ">
          <div>
            <div className="lg:max-w-sm flex justify-center w-full">
              {!imgLoaded && (
                <div className="w-[24rem] h-[24rem] bg-gray-100 rounded-lg animate-pulse"></div>
              )}
              <img
                className={`object-fill rounded-lg shrink-0 ${
                  imgLoaded
                    ? 'visible w-screen'
                    : 'invisible absolute w-2.5 h-2.5'
                }`}
                src={gatewayFromIpfs(nft?.url)}
                onLoad={() => setImgLoaded(true)}
                alt=""
              />
            </div>
          </div>

          <div
            className="p-0 lg:px-4
          w-screen
          h-[27rem]
          max-h-full max-w-full
          lg:max-w-md
          "
          >
            <div className="mb-2 flex flex-row items-center justify-between w-full">
              <Text className="text-gray-900" size="lg" weight="medium">
                {nft?.collectionTitle}
              </Text>
              <button
                className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
                onClick={() => {
                  handleClose(false)
                }}
              >
                <HiOutlineX />
              </button>
            </div>
            <Text
              className="mb-5 lg:mb-10 text-gray-900"
              size="4xl"
              weight="semibold"
            >
              {nft?.title}
            </Text>

            <div>
              <div
                className="
                border-t-0 border-l-0 border-r-0
                rounded-none bg-white mt-2 lg:mt-8 lg:mb-4"
              >
                <Text className=" text-gray-900" size="lg" weight="semibold">
                  <button
                    className={
                      'relative flex justify-between\
                     items-center w-full py-4\
                    text-left bg-white border-0 rounded-none\
                     transition focus:outline-none'
                    }
                    onClick={() => {
                      setOpenedDetails(!openedDetails)
                    }}
                    type="button"
                  >
                    <Text className="text-gray-900" weight="semibold">
                      Details
                    </Text>

                    <HiChevronDown
                      className={
                        openedDetails ? 'rotate-180 transition' : 'transition'
                      }
                    ></HiChevronDown>
                  </button>
                </Text>

                <div
                  className={
                    openedDetails
                      ? `border-0 visible flex flex-wrap flex-row max-w-full ${noDetails}`
                      : `border-0 collapse  flex flex-wrap flex-row max-w-full ${noDetails}`
                  }
                >
                  <div className=" w-screen flex-wrap truncate">
                    {nft?.details?.length ? (
                      nft.details.map(
                        (d: {
                          name: string
                          value: any
                          isCopyable: boolean
                        }) => {
                          return (
                            <div
                              key={d.name}
                              className="flex flex-row justify-between"
                            >
                              <Text
                                size="xs"
                                weight="medium"
                                className="text-gray-400 pb-2"
                              >
                                {d.name}
                              </Text>
                              {(d.isCopyable && (
                                <div className="flex items-center">
                                  {hover === d.name && (
                                    <Text
                                      size="xs"
                                      weight="semibold"
                                      className="
                                  pb-2 mr-2
                                  max-w-[12rem]
                                  overflow-hidden"
                                    >
                                      {copied ? 'Copied!' : 'Copy'}
                                    </Text>
                                  )}
                                  <button>
                                    <Text
                                      size="xs"
                                      weight="semibold"
                                      className="text-gray-700 pb-2 max-w-[12rem] sm:max-w-[19rem] lg:max-w-[17rem]
                            truncate"
                                      onClick={async () => {
                                        navigator.clipboard.writeText(d.value)
                                        setCopied(true)
                                        await setTimeout(() => {
                                          setCopied(false)
                                        }, 1500)
                                      }}
                                      onMouseEnter={() => setHover(d.name)}
                                      onMouseLeave={() => setHover('')}
                                    >
                                      {d.value}
                                    </Text>
                                  </button>
                                </div>
                              )) || (
                                <Text
                                  size="xs"
                                  weight="semibold"
                                  className="text-gray-700 pb-2 max-w-[12rem] md:max-w-[16rem] lg:max-w-[18rem]
                            truncate"
                                >
                                  {d.value}
                                </Text>
                              )}
                            </div>
                          )
                        }
                      )
                    ) : (
                      <div className="text-gray-400 items-center justify-center text-center">
                        No details
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr />

              <div
                className="
              border-t-0 border-l-0 border-r-0
              rounded-none bg-white my-2 lg:my-4"
              >
                <Text
                  className="
                  ml-1 mb-2 text-gray-900"
                  size="lg"
                  weight="semibold"
                >
                  <button
                    className={
                      'relative flex justify-between\
                       items-center w-full py-4\
                      text-left bg-white border-0 rounded-none\
                       transition focus:outline-none'
                    }
                    type="button"
                    onClick={() => {
                      setOpenedProps(!openedProps)
                    }}
                  >
                    <Text className="text-gray-900" weight="semibold">
                      Properties
                    </Text>
                    <HiChevronDown
                      className={
                        openedProps ? 'rotate-180 transition' : 'transition'
                      }
                    ></HiChevronDown>
                  </button>
                </Text>

                <div
                  className={
                    openedProps
                      ? `border-0 visible flex flex-wrap flex-row max-w-md  ${noProps}`
                      : `border-0 collapse flex flex-wrap flex-row max-w-md  ${noProps}`
                  }
                >
                  <div className="flex flex-row  flex-wrap ">
                    {nft?.properties?.length ? (
                      nft?.properties.map(
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
                      )
                    ) : (
                      <div className="text-gray-400 items-center justify-center text-center">
                        No properties
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default NftModal
