import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'
import { IconType } from 'react-icons'

export type FeaturePillProps = {
  Icon?: IconType
  text: string
}

export const FeaturePill = ({ Icon, text }: FeaturePillProps) => (
  <Pill className="bg-gray-600 flex flex-row items-center gap-2">
    {Icon && <Icon className="text-white" />}
    <Text size="xs" weight="medium" className="text-white">
      {text}
    </Text>
  </Pill>
)
