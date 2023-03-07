import { useState } from 'react'

import NftModal from '../../modal'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { HiArrowNarrowRight } from 'react-icons/hi'

import { gatewayFromIpfs } from '@kubelt/utils'

import missingNftSvg from '../../../../assets/missing-nft.svg'

const ModaledNft = ({ nft, isModal, handleRedirect }: any) => {
  const [showModal, setShowModal] = useState(false)

  const [loadFail, setLoadFail] = useState(false)

  const url = gatewayFromIpfs(nft.url)
  return (
    <>
      {isModal ? (
        <>
          <NftModal
            nft={nft}
            isOpen={showModal}
            handleClose={() => setShowModal(false)}
          />
          <button className="relative cursor-pointer w-full group">
            <div
              onClick={() => {
                if (!loadFail) {
                  setShowModal(true)
                }
              }}
              className="absolute
                left-0 right-0 top-0 bottom-0
                p-1 lg:p-4 flex flex-col
                justify-end transition-all
                duration-300 rounded-lg
                invisible
                group-hover:visible
                hover:bg-black/[.4]"
            >
              <Text
                size="sm"
                weight="semibold"
                className="text-white
                invisible
                group-hover:visible
                hover:opacity-100
                "
              >
                {nft.collectionTitle}
              </Text>
              <Text
                size="sm"
                weight="semibold"
                className="text-white
                invisible
                group-hover:visible
                hover:opacity-100
               "
              >
                {nft.title}
              </Text>
            </div>

            <img
              className="object-cover
              w-full
              rounded-lg 
              md:h-[424px]
              lg:h-[270px]"
              src={
                loadFail
                  ? missingNftSvg
                  : gatewayFromIpfs(nft.url ?? nft.thumbnailUrl)
              }
              onError={(e) => setLoadFail(true)}
              alt="collection-item"
            />
          </button>
        </>
      ) : (
        <button
          className="rounded-lg
          truncate
          shadow 
          transition-shadow
          text-sm 
          font-semibold
          w-full
          hover:shadow-lg
         "
          onClick={() => {
            handleRedirect(nft)
          }}
        >
          <img
            className="object-cover
            w-full
            rounded-t-lg 
            md:h-[424px]
            lg:h-[270px] 
            xl:h-[270px]"
            src={
              loadFail
                ? missingNftSvg
                : gatewayFromIpfs(nft.url ?? nft.thumbnailUrl)
            }
            onError={(e) => setLoadFail(true)}
            alt="collection representative"
          />
          <div
            className="flex text-gray-600
            flex-row whitespace-nowrap 
            w-full justify-between items-center
            px-4 py-3"
          >
            <div className="truncate leading-none">
              {nft.collectionTitle ? nft.collectionTitle : ' '}
            </div>
            <div className="text-xl">
              <HiArrowNarrowRight />
            </div>
          </div>
        </button>
      )}
    </>
  )
}

export default ModaledNft
