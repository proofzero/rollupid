import React from 'react'
import LoadingGrid from '.'

export default {
  title: 'Molecules/NFTs/grid',
  component: LoadingGrid,
  argTypes: {
    quantity: {
      defaultValue: 5,
      control: { type: 'number' },
    },
  },
}

const Template = ({ quantity }: { quantity: number }) => {
  return <LoadingGrid numberOfCells={quantity} />
}

export const Loading = Template.bind({})
