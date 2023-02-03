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
  })

  return (
    <UnfilteredGrid
      nfts={nfts}
      loadingConditions={false}
      account={'0x123...'}
      getMoreNfts={() => {}}
      displayText={'Lorem Ipsum'}
      isModal={false}
    />
  )
}

export const Unfiltered = Template.bind({})
