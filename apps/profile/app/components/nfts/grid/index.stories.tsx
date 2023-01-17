import React from 'react'
import NftGrid from '.'
import ModaledNft from '../interactible/modaled'

export default {
  title: 'Molecules/NFTs/grid',
  component: NftGrid,
  argTypes: {
    quantity: {
      defaultValue: 4,
      control: { type: 'number' },
    },
  },
}

const Template = ({ quantity }: { quantity: number }) => {
  const nfts = Array(quantity).fill({
    collectionTitle: 'Lorem Ipsum',
    thumbnailUrl: 'https://avatars.githubusercontent.com/u/96090171?s=400&v=4',
  })

  return (
    <>
      <NftGrid
        nfts={nfts}
        loadingConditions={false}
        getMoreNfts={() => {}}
        nftRenderer={(nft, isSelected, handleRedirect) => (
          <ModaledNft nft={nft} />
        )}
      />
    </>
  )
}

export const Basic = Template.bind({})
