import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'

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
        className="my-2.5 mx-2 bg-white"
        size={TextSize.XS}
        color={TextColor.Gray900}
        weight={TextWeight.Medium500}
      >
        {nft.title ?? 'Untitled'}
      </Text>
    </div>
  )
}

export default SelectableNft
