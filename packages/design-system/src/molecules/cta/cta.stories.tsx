import React from 'react'
import { CTA } from './cta'

export default {
  title: 'Atoms/Pills/Icon',
  component: CTA,
}

const Template = (args) => (
  <CTA
    clickHandler={() => {
      return
    }}
  />
)

export const Default = Template.bind({})
