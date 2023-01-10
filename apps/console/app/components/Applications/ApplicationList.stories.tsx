import React from 'react'
import { ApplicationList } from './ApplicationList'
import { ApplicationListItemProps } from './ApplicationListItem'

export default {
  title: 'Molecules/Applications/List',
  component: ApplicationList,
}

const applications: ApplicationListItemProps[] = [
  {
    title: 'Courtyard',
    createdTimestamp: new Date(),
    published: true,
    iconUrl: 'https://picsum.photos/250/250',
  },
  {
    title: 'Pokemon',
    createdTimestamp: new Date(),
    iconUrl: 'https://picsum.photos/250/250',
  },
  {
    title: 'Baseball',
    createdTimestamp: new Date(),
    published: true,
  },
]

const Template = () => <ApplicationList applications={applications} />

export const Default = Template.bind({})
