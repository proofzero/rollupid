import React from 'react'

import { Avatar, AvatarProps } from './Avatar'

// @ts-ignore
// import MDXDoc from './Text.documentation.mdx'

export default {
  title: 'Atoms/Avatar',
  component: Avatar,
  argTypes: {
    src: {
      defaultValue: 'https://picsum.photos/128',
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
