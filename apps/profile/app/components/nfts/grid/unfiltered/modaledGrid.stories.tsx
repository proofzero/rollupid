import React from 'react'
import UnfilteredGrid from '.'
import threeIdLogo from '../../../../assets/three-id-logo.svg'

export default {
  title: 'Molecules/NFTs/grid',
  component: UnfilteredGrid,
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
    url: threeIdLogo,
    details: [
      { name: 'Lorem', value: 'ipsum' },
      { name: 'Lorem', value: 'ipsum' },
      { name: 'Lorem', value: 'ipsum' },
    ],
    properties: [
      { name: 'Lorem', value: 'ipsum' },
      { name: 'Lorem', value: 'ipsum' },
      { name: 'Lorem', value: 'ipsum' },
    ],
  })

  return (
    <>
      <UnfilteredGrid
        nfts={nfts}
        loadingConditions={false}
        account={'0x123...'}
        getMoreNfts={() => {}}
        displayText={'Lorem Ipsum'}
        isModal={false}
        isModalNft={true}
      />
    </>
  )
}

export const Interactible = Template.bind({})
