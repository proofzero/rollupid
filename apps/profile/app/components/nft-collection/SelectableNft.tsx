import { HiArrowNarrowRight } from 'react-icons/hi'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { gatewayFromIpfs } from '@kubelt/utils'

import missingNftSvg from '~/assets/missing-nft.svg'
import { useState } from 'react'

const SelectableNft = ({ nft, hovered = false, handleSelectedNft }: any) => {
  const [loadFail, setLoadFail] = useState(false)

  return (
    <>
      {hovered ? (
        <div className="relative cursor-pointer group">
          <button
            onClick={() => {
              handleSelectedNft(nft)
            }}
            className="absolute
        items-center
        left-0 right-0 top-0 bottom-0
        p-1 lg:p-4 flex flex-col
        justify-end transition-all
        w-full
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
          </button>

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
      ) : (
        <button
          className="rounded-lg
          truncate
          shadow 
          transition-shadow
          text-sm 
          font-semibold
          w-full
          hover:shadow-xl 
          flex
          flex-col
          align-center justify-center
         "
          onClick={() => {
            handleSelectedNft(nft)
          }}
        >
          <img
            className="rounded-t-lg block
                lg:h-[8rem]
                md:h-[11rem]
                sm:h-[12rem]
                h-[20rem]
                object-contain 
                mx-auto 
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
        </button>
      )}
    </>
  )
}

export default SelectableNft
