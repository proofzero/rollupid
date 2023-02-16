import React from 'react'
import { ApplicationList } from './ApplicationList'
import type { ApplicationListItemProps } from './ApplicationListItem'

export default {
  title: 'Molecules/Applications/List',
  component: ApplicationList,
}

const applications: ApplicationListItemProps[] = [
  {
    id: '1',
    name: 'Courtyard',
    createdTimestamp: new Date().getTime(),
    published: true,
    icon: 'https://picsum.photos/250/250',
  },
  {
    id: '2',
    name: 'Pokemon',
    createdTimestamp: new Date().getTime(),
    icon: 'https://picsum.photos/250/250',
  },
  {
    id: '3',
    name: 'Baseball',
    createdTimestamp: new Date().getTime(),
    published: true,
  },
]

const Template = () => <ApplicationList applications={applications} />

export const Default = Template.bind({})
