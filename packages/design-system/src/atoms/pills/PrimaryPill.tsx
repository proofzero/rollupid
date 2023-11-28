import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'
import Info from '../info/Info'

export const PrimaryPill = () => (
  <Pill className="bg-gray-100 flex flex-row items-center rounded-xl">
    <Info
      name="Passport Profile"
      description="Passport profile will be shared with applications that you authorize that request your public profile."
      editable={true}
    />
    <Text size="xs" weight="medium" className="text-gray-600 ml-2">
      Passport Profile
    </Text>
  </Pill>
)
