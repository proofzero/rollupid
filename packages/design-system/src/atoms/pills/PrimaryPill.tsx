import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'

export type PrimaryPillProps = {
  text: string
}

export const PrimaryPill = ({ text }: PrimaryPillProps) => (
  <Pill className="bg-indigo-50">
    <Text size="xs" weight="medium" className="text-indigo-600">
      {text}
    </Text>
  </Pill>
)
