import React from 'react'
import { HiOutlineEyeOff } from 'react-icons/hi'
import { IconPill } from './IconPill'

export default {
  title: 'Atoms/Pills/Icon',
  component: IconPill,
}

const Template = (args) => <IconPill {...args} Icon={HiOutlineEyeOff} />

export const Default = Template.bind({})
