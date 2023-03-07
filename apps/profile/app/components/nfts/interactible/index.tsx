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
        <button className="relative w-full cursor-pointer group">
          <div
            onClick={() => {
              handleSelectedNft(nft)
            }}
            className="absolute
        items-center
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
            className="object-contain
            w-full
            rounded-lg
            md:h-[424px]
            lg:h-[180px] 
            xl:h-[270px]
            2xl:h-[300px]  "
            src={
              loadFail
                ? missingNftSvg
                : gatewayFromIpfs(nft.url ?? nft.thumbnailUrl)
            }
            onError={(e) => setLoadFail(true)}
            alt="collection-item"
          />
        </button>
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
            handleSelectedNft(nft)
          }}
        >
          <img
            className="object-contain
            w-full
            rounded-t-lg
            md:h-[424px]
            lg:h-[180px] 
            xl:h-[270px]
            2xl:h-[300px]  
            "
            src={
              loadFail
                ? missingNftSvg
                : gatewayFromIpfs(nft.url ?? nft.thumbnailUrl)
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
