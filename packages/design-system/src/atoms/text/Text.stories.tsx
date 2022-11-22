import React from 'react'
import { Text, TextProps } from './Text'

// @ts-ignore
import MDXDoc from './Text.documentation.mdx'

export default {
  title: 'Atoms/Text',
  component: Text,
  argTypes: {
    size: {
      defaultValue: 'base',
    },
    text: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    docs: {
      page: MDXDoc,
    },
  },
}

const Template = ({
  text = 'Lorem ipsum',
  ...args
}: TextProps & { text: string }) => <Text {...args}>{text}</Text>

export const Default = Template.bind({})
Default.parameters = {
  controls: {
    exclude: ['type'],
  },
}
