import React from 'react'
import NftGrid from '.'
import ModaledNft from '../interactible/modaled'
import threeIdLogo from '../../../assets/three-id-logo.svg'

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
    thumbnailUrl: threeIdLogo,
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
