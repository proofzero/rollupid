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
    created: new Date(),
    published: true,
    iconUrl: 'https://picsum.photos/250/250',
  },
  {
    title: 'Pokemon',
    created: new Date(),
    iconUrl: 'https://picsum.photos/250/250',
  },
  {
    title: 'Baseball',
    created: new Date(),
    published: true,
  },
]

const Template = () => <ApplicationList applications={applications} />

export const Default = Template.bind({})
