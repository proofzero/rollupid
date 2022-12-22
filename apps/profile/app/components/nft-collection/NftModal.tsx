import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'

import { HiChevronDown } from 'react-icons/hi'

import nftModalStyles from './NftModal.css'

import type { LinksFunction } from '@remix-run/cloudflare'

import { gatewayFromIpfs } from '~/helpers'

import { useState } from 'react'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: nftModalStyles },
]

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
  const [openedDetails, setOpenedDetails] = useState(
    nft?.properties?.length == 0
  )
  const [openedProps, setOpenedProps] = useState(nft?.properties?.length > 0)
  const noProps =
    nft?.properties?.length > 0 ? '' : 'items-center justify-center text-center'
  const noDetails =
    nft?.details?.length > 0 ? '' : 'items-center justify-center text-center'

  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div
        className={`flex-1 relative h-max w-full sm:min-w-[37rem] sm:max-h-[35rem] sm:max-w-[58rem] h-[86vh] sm:w-[62vw]
          transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
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
            className="p-0 lg:p-4
          w-screen
          h-[27rem]
          max-h-full max-w-full
          lg:max-w-md
          lg:max-h-md
          mt-3"
          >
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

            <div
              className="accordion-item 
                border-t-0 border-l-0 border-r-0 
                rounded-none bg-white mt-2 lg:mt-8 lg:mb-4"
            >
              <Text
                className="accordion-header ml-1 text-gray-900"
                size="lg"
                weight="semibold"
                id="flush-headingOne"
              >
                <button
                  className={
                    'relative collapsed flex justify-between\
                     items-center w-full py-4\
                    text-left bg-white border-0 rounded-none\
                     transition focus:outline-none'
                  }
                  onClick={() => {
                    setOpenedDetails(!openedDetails)
                  }}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseOne"
                  aria-expanded="true"
                  aria-controls="flush-collapseOne"
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
                id="flush-collapseOne"
                className={
                  openedDetails
                    ? `accordion-collapse border-0 collapse show flex flex-wrap flex-row max-w-md  overflow-hidden ${noDetails}`
                    : `accordion-collapse border-0 collapse flex flex-wrap flex-row max-w-md  overflow-hidden ${noDetails}`
                }
                aria-labelledby="flush-headingOne"
              >
                <div className="accordion-body w-[100vw] flex-wrap">
                  {nft?.details?.length ? (
                    nft.details.map((d: { name: string; value: any }) => {
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
                          <Text
                            size="xs"
                            weight="semibold"
                            className="text-gray-700 pb-2"
                          >
                            {d.value}
                          </Text>
                        </div>
                      )
                    })
                  ) : (
                    <div className="accordion-body text-gray-400 items-center justify-center text-center">
                      No details
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <div
              className="accordion-item 
              border-t-0 border-l-0 border-r-0
              rounded-none bg-white mt-2 lg:mt-4"
            >
              <Text
                className="accordion-header 
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
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseTwo"
                  aria-expanded="false"
                  aria-controls="flush-collapseTwo"
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
                id="flush-collapseTwo"
                className={
                  openedProps
                    ? `accordion-collapse border-0 collapse show flex flex-wrap flex-row max-w-md  overflow-hidden ${noProps}`
                    : `accordion-collapse border-0 collapse flex flex-wrap flex-row max-w-md  overflow-hidden ${noProps}`
                }
                aria-labelledby="flush-headingTwo"
              >
                <div className="accordion-body flex flex-row  flex-wrap ">
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
                    <div className="accordion-body text-gray-400 items-center justify-center text-center">
                      No properties
                    </div>
                  )}
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
