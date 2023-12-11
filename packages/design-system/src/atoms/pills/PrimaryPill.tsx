import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'
import Info from '../info/Info'

export const PrimaryPill = () => (
  <Pill className="bg-gray-100 flex flex-row items-center rounded-xl">
    <Info
      name="Primary Account"
      description="Primary Account sets your default profile picture and display name. Defaults can be overwritten in Passport Profile settings."
      editable={true}
    />
    <Text size="xs" weight="medium" className="text-gray-600 ml-2">
      Primary Account
    </Text>
  </Pill>
)
