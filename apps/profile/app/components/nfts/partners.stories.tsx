import React from 'react'
import ShowPartners from './partners'

import type { Meta } from '@storybook/react'

export default {
  title: 'Molecules/NFTs',
  component: ShowPartners,
} as Meta

const Template = () => {
  return (
    <>
      <ShowPartners />
    </>
  )
}

export const Partners = Template.bind({})
