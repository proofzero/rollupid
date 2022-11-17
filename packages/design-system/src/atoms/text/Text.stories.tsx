import React from 'react'
import Text, { TextProps } from './Text'

// @ts-ignore
import MDXDoc from './Text.documentation.mdx';

export default {
  title: 'Atoms/Text',
  component: Text,
  argTypes: {
    weight: {
      defaultValue: 'normal'
    },
    type: {
      defaultValue: 'span'
    },
    text: {
      control: {
        type: 'text'
      }
    }
  },
  parameters: {
    docs: {
      page: MDXDoc,
    },
  },
}

const Template = ({ text = "Lorem ipsum", ...args }: TextProps & { text: string }) => <Text {...args}>{text}</Text>

const genSizeControl = (template: any, size: string) => {
  const control = template.bind({})
  control.args = {
    size,
    text: `text-${size}`
  }
  control.parameters = {
    controls: {
      exclude: ['size']
    }
  }

  return control
}

export const TextXs = genSizeControl(Template, 'xs')
export const TextSm = genSizeControl(Template, 'sm')
export const TextBase = genSizeControl(Template, 'base')
export const TextLg = genSizeControl(Template, 'lg')
export const TextXl = genSizeControl(Template, 'xl')
export const Text2Xl = genSizeControl(Template, '2xl')
export const Text3Xl = genSizeControl(Template, '3xl')
export const Text4Xl = genSizeControl(Template, '4xl')
export const Text5Xl = genSizeControl(Template, '5xl')
