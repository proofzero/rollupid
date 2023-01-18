import React from 'react'
import FilteredGrid from '.'

import threeIdLogo from '../../../../assets/three-id-logo.svg'

export default {
  title: 'Molecules/NFTs/grid',
  component: FilteredGrid,
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
      <FilteredGrid
        nfts={nfts}
        loadingConditions={false}
        account={'0x123...'}
        getMoreNfts={() => {}}
        displayText={'Lorem Ipsum'}
        isModal={false}
      />
    </>
  )
}

export const Filtered = Template.bind({})
