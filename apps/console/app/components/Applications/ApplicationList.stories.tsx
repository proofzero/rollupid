import React from 'react'
import { ApplicationList } from './ApplicationList'
import type { ApplicationListItemProps } from './ApplicationListItem'
import {
  blue,
  gray,
} from '@proofzero/design-system/src/placeholders/rollup/b64'

export default {
  title: 'Molecules/Applications/List',
  component: ApplicationList,
}

const applications: ApplicationListItemProps[] = [
  {
    id: '1',
    name: 'Courtyard',
    createdTimestamp: 1672549200000,
    published: true,
    icon: blue,
  },
  {
    id: '2',
    name: 'Pokemon',
    createdTimestamp: 1672549200000,
    icon: gray,
  },
  {
    id: '3',
    name: 'Baseball',
    createdTimestamp: 1672549200000,
    published: true,
  },
]

const Template = () => <ApplicationList applications={applications} />

export const Default = Template.bind({})
