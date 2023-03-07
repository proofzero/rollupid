import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'

export type FeaturePillProps = {
  text: string
}

export const FeaturePill = ({ text }: FeaturePillProps) => (
  <Pill className="bg-gray-600">
    <Text size="xs" weight="medium" className="text-white">
      {text}
    </Text>
  </Pill>
)
