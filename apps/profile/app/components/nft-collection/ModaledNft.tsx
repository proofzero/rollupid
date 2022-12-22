import { useState } from 'react'

import NftModal from './NftModal'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { Link } from '@remix-run/react'

import { HiArrowNarrowRight } from 'react-icons/hi'

import { gatewayFromIpfs } from '~/helpers'

import missingNftSvg from '~/assets/missing-nft.svg'

const ModaledNft = ({ nft, isModal }: any) => {
  const [showModal, setShowModal] = useState(false)

  const [loadFail, setLoadFail] = useState(false)
  return (
    <>
      {isModal ? (
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
              alt="collection-item"
            />
          </div>
        </>
      ) : (
        <div
          className="rounded-lg
          truncate
          shadow 
          transition-shadow
          text-sm 
          font-semibold
          hover:shadow-xl 
          lg:w-[13rem]
          md:w-[14rem]
          sm:w-[15rem]
          min-[410px]:w-[22rem]
          w-[18rem]
          flex
          flex-col
          align-center justify-center
         "
        >
          <Link to={`./${nft.details[0].value}`}>
            <img
              className="rounded-t-lg block 
              mx-auto 
              lg:h-[13rem] 
              lg:max-w-[13rem]
              md:h-[14rem]
              md:max-w-[14rem]
              sm:h-[15rem]
              sm:max-w-[15rem]
              "
              src={
                loadFail
                  ? missingNftSvg
                  : gatewayFromIpfs(nft.thumbnailUrl ?? nft.url)
              }
              onError={(e) => setLoadFail(true)}
              alt="collection-representation"
            />
            <div
              className="flex text-gray-600
            flex-row whitespace-nowrap 
            w-full
            justify-between items-center px-4 py-3"
            >
              <div className="truncate leading-none">
                {nft.collectionTitle ? nft.collectionTitle : ' '}
              </div>
              <div className="text-xl">
                <HiArrowNarrowRight />
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  )
}

export default ModaledNft
