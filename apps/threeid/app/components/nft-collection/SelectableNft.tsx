import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

const SelectableNft = ({ nft, handleSelectedNft }: any) => {
  return (
    <div className="relative border" onClick={() => handleSelectedNft(nft)}>
      <img className="w-full" src={nft.url} />

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
