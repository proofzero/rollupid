import React from 'react'
import { SortableList } from './SortableList'

export default {
  title: 'Atoms/Lists/Sortable list',
  component: SortableList,
}

const Template = (args) => (
  <SortableList
    {...args}
    items={[<p key={'Foo'}>Hello</p>, <p key={'Bar'}>world</p>]}
  />
)

export const Default = Template.bind({})
