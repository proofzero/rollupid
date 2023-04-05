import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'

import { TbCrown } from 'react-icons/tb'

export type PrimaryPillProps = {
  text: string
}

export const PrimaryPill = ({ text }: PrimaryPillProps) => (
  <Pill className="bg-gray-100 flex flex-row items-center rounded-xl">
    <TbCrown className="text-yellow-500 mr-2" />
    <Text size="xs" weight="medium" className="text-gray-600">
      {text}
    </Text>
  </Pill>
)
