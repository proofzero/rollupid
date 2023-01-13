import React, { Key } from 'react'
import { SortableList } from './SortableList'

export default {
  title: 'Atoms/Lists/Sortable list',
  component: SortableList,
}

const Template = (args) => (
  <SortableList
    {...args}
    items={[
      { key: 'hello', val: 'Hello' },
      { key: 'world', val: 'world!' },
    ]}
    itemRenderer={(item) => <p>{item.val}</p>}
  />
)

export const Default = Template.bind({})
