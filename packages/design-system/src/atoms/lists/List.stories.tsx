import React, { Key } from 'react'
import { List } from './List'

export default {
  title: 'Atoms/Lists/List',
  component: List,
}

const Template = (args) => (
  <List
    {...args}
    items={[
      { key: 'hello', val: 'Hello' },
      { key: 'world', val: 'world!' },
    ]}
    itemRenderer={(item) => <p>{item.val}</p>}
  />
)

export const Default = Template.bind({})
