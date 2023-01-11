import React from 'react'

import { IconType } from 'react-icons/lib'
import { Pill } from './Pill'

export type IconPillProps = {
  Icon: IconType
}

export const IconPill = ({ Icon }: IconPillProps) => (
  <Pill className="bg-gray-50">
    <Icon className="text-gray-600 w-4 h-4" />
  </Pill>
)
