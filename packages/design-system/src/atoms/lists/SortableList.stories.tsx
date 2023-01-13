import React from 'react'
import { SortableList } from './SortableList'

export default {
  title: 'Atoms/Lists/Sortable list',
  component: SortableList,
}

const Template = (args) => <SortableList {...args} items={['Hello', 'world']} />

export const Default = Template.bind({})
