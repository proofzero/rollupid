import React from 'react'
import { blue } from '../../../placeholders/rollup/b64'

import { Avatar, AvatarProps } from './Avatar'

// @ts-ignore
// import MDXDoc from './Text.documentation.mdx'

export default {
  title: 'Atoms/Profile/Avatar',
  component: Avatar,
  argTypes: {
    src: {
      defaultValue: blue,
    },
    size: {
      defaultValue: 'md',
    },
    hex: {
      defaultValue: false,
    },
    border: {
      defaultValue: false,
    },
  },
}

const Template = ({ ...args }: AvatarProps) => <Avatar {...args} />

export const Default = Template.bind({})
