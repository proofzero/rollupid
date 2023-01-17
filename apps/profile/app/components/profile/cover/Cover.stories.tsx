import React from 'react'

import { Cover, CoverProps } from './Cover'

export default {
  title: 'Atoms/Profile/Cover',
  component: Cover,
  argTypes: {
    src: {
      defaultValue: 'https://picsum.photos/1920/256',
    },
    isOwner: {
      defaultValue: false,
    },
    updateCoverHandler: {
      defaultValue: (file: string) => {
        console.log('updateCoverHandler', file)
      },
    },
  },
}

const Template = ({ ...args }: CoverProps) => <Cover {...args} />

export const Default = Template.bind({})
