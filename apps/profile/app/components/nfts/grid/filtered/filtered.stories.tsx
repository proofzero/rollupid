import React from 'react'
import FilteredGrid from '.'

export default {
  title: 'Molecules/nfts/grid',
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
    thumbnailUrl: 'https://avatars.githubusercontent.com/u/96090171?s=400&v=4',
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
