import React from 'react'

import { Pepe } from './Pepe'

export default {
  title: 'Atoms/Pepe',
  component: Pepe,
}

const Template = (args) => <Pepe {...args} />

export const Default = Template.bind({})
