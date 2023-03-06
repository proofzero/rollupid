import React from 'react'
import { ApplicationList } from './ApplicationList'
import type { ApplicationListItemProps } from './ApplicationListItem'
import { blue, gray } from '@kubelt/design-system/src/placeholders/rollup/b64'

export default {
  title: 'Molecules/Applications/List',
  component: ApplicationList,
}

const applications: ApplicationListItemProps[] = [
  {
    id: '1',
    name: 'Courtyard',
    createdTimestamp: new Date(2023, 0).getTime(),
    published: true,
    icon: blue,
  },
  {
    id: '2',
    name: 'Pokemon',
    createdTimestamp: new Date(2023, 0).getTime(),
    icon: gray,
  },
  {
    id: '3',
    name: 'Baseball',
    createdTimestamp: new Date(2023, 0).getTime(),
    published: true,
  },
]

const Template = () => <ApplicationList applications={applications} />

export const Default = Template.bind({})
