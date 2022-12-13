import React from 'react'
import { HiBookOpen } from 'react-icons/hi'
import { Text } from '../text/Text'
import { Panel } from './Panel'

export default {
  title: 'Atoms/Panel',
  component: Panel,
  argTypes: {
    title: {
      defaultValue: 'Lorem Ipsum',
    },
  },
  parameters: {
    controls: {
      exclude: ['titleCompanion'],
    },
  },
}

const Template = (args) => (
  <Panel {...args}>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas aliquam
      nunc id dui elementum scelerisque. Maecenas efficitur sed lorem vel
      porttitor. In hac habitasse platea dictumst. Suspendisse finibus enim id
      ex aliquet posuere. Phasellus a dapibus massa. Mauris convallis dolor
      faucibus enim commodo, et commodo ligula feugiat. Donec a molestie augue,
      at facilisis mauris. Vivamus eu elit eget nisi pulvinar cursus in id dui.
      Donec neque dolor, finibus tempus imperdiet ut, mattis nec dolor. Ut
      vulputate lobortis sapien vel malesuada.
    </Text>
  </Panel>
)

export const Default = Template.bind({})

export const IconCompanion = Template.bind({})
IconCompanion.args = {
  titleCompanion: (
    <span className="p-2 border rounded">
      <HiBookOpen className="text-gray-400" />
    </span>
  ),
}

export const ComplexCompanion = Template.bind({})
ComplexCompanion.args = {
  titleCompanion: (
    <div>
      <Text size="xs" weight="medium" className="text-gray-400">
        Created: Fri 28.08.2022
      </Text>
      <Text size="xs" weight="medium" className="text-indigo-500">
        Roll keys
      </Text>
    </div>
  ),
}
