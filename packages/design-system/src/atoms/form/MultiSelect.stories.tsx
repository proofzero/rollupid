import React from 'react'
import { SCOPES_JSON } from '@proofzero/security/scopes'
import { MultiSelect } from './MultiSelect'

export default {
  title: 'Atoms/Form/MultiSelectCombo',
  component: MultiSelect,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
    fieldName: {
      defaultValue: 'fieldName',
    },
    items: {
      defaultValue: Object.entries(SCOPES_JSON).map(([key, value]) => {
        return {
          id: key,
          val: value.name,
          desc: value.devDescription,
        }
      }),
    },
  },
}

const Template = (args) => (
  <div className='w-[465px]'>
    <MultiSelect {...args} />
  </div>
)

export const Default = Template.bind({})
