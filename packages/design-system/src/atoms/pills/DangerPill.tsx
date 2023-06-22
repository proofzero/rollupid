import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

export type DangerPillProps = {
  text: string
}

export const DangerPill = ({ text }: DangerPillProps) => (
  <Pill className="bg-orange-50 flex flex-row items-center rounded-xl">
    <HiOutlineExclamationTriangle className="text-orange-600 mr-2" />
    <Text size="xs" weight="medium" className="text-orange-600">
      {text}
    </Text>
  </Pill>
)
