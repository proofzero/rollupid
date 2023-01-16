import type { FilterProps } from './index'
import Filters from './index'
import React from 'react'

import { ReactComponent as threeidLogo } from '~/assets/three-id-logo.svg'

export default {
  title: 'Atoms/NFTs/Filters',
  component: Filters,
  argTypes: {
    pfp: { defaultValue: threeidLogo },
    colFilters: {
      defaultValue: [
        { title: 'All Collections', img: threeidLogo },
        { title: 'Untitled Collections', img: threeidLogo },
      ],
    },
  },
}

const Template = (args: FilterProps) => <Filters {...args} />

export const Default = Template.bind({})
