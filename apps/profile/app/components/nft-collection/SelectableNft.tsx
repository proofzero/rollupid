import { HiArrowNarrowRight } from 'react-icons/hi'

import { gatewayFromIpfs } from '~/helpers'

import missingNftSvg from '~/assets/missing-nft.svg'
import { useState } from 'react'

const SelectableNft = ({ nft, selected, handleSelectedNft }: any) => {
  const [loadFail, setLoadFail] = useState(false)

  return (
    <div
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
        // for now smaller height
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
    </div>
  )
}

export default SelectableNft
