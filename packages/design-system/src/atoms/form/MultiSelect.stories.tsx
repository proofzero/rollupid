import React from 'react'
import MultiSelect from './MultiSelect'

export default {
  title: 'Atoms/Form/MultiSelectCombo',
  component: MultiSelect,
}

const Template = (args) => (
  <MultiSelect
    {...args}
    label="MultiSelect"
    fieldName="scopes"
    items={[
      {
        key: 'foo',
        val: 'bar',
        class: 'baz',
      },
      {
        key: 'alice',
        val: 'bob',
        class: 'candice',
      },
    ]}
  />
)

export const Default = Template.bind({})
