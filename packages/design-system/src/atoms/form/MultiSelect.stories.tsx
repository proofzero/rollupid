import React from 'react'
import { SCOPES } from '@kubelt/security/scopes'
import { MultiSelect } from './MultiSelect'

export default {
  title: 'Atoms/Form/MultiSelectCombo',
  component: MultiSelect,
}

const Template = (args) => (
  <MultiSelect
    {...args}
    label="MultiSelect"
    fieldName="scopes"
    items={Object.entries(SCOPES).map(([key, value]) => {
      return {
        id: key,
        val: value.name,
        desc: value.description,
      }
    })}
  />
)

export const Default = Template.bind({})
