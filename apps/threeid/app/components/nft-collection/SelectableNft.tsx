import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'

const SelectableNft = ({ nft, selected, handleSelectedNft }: any) => {
  return (
    <div
      className={`relative border cursor-pointer hover:scale-105 ${
        selected ? 'scale-105' : ''
      }`}
      onClick={() => handleSelectedNft(nft)}
    >
      <img className="w-full" src={gatewayFromIpfs(nft.url)} />

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
