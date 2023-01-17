import React from 'react'
import UnfilteredGrid from '.'

export default {
  title: 'Molecules/nfts/grid',
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
    thumbnailUrl: 'https://avatars.githubusercontent.com/u/96090171?s=400&v=4',
    url: 'https://avatars.githubusercontent.com/u/96090171?s=400&v=4',
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
