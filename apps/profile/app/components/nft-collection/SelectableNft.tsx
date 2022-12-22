import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { gatewayFromIpfs } from '~/helpers'

import missingNftSvg from '~/assets/missing-nft.svg'
import { useState } from 'react'

const SelectableNft = ({ nft, selected, handleSelectedNft }: any) => {
  const [loadFail, setLoadFail] = useState(false)

  return (
    <div
      className={`relative border ${
        loadFail ? '' : 'cursor-pointer'
      } hover:scale-105 ${selected ? 'scale-105' : ''}`}
      onClick={() => {
        if (!loadFail) {
          handleSelectedNft(nft)
        }
      }}
    >
      <img
        className="w-full"
        src={loadFail ? missingNftSvg : gatewayFromIpfs(nft.url)}
        onError={(e) => setLoadFail(true)}
      />

      <Text
        className="my-2.5 mx-2 bg-white text-gray-900"
        size="xs"
        weight="medium"
      >
        {nft.title ?? 'Untitled'}
      </Text>
    </div>
  )
}

export default SelectableNft
