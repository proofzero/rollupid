import React from 'react'
import UnfilteredGrid from '.'
import rollupIdLogo from '../../../../assets/rollup-id-logo.svg'

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
    thumbnailUrl: rollupIdLogo,
    url: rollupIdLogo,
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
        getMoreNfts={() => {}}
        displayText={'Lorem Ipsum'}
        isModal={false}
        isModalNft={true}
      />
    </>
  )
}

export const Interactible = Template.bind({})
