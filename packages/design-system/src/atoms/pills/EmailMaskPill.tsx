import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'

import { TbShield, TbShieldOff } from 'react-icons/tb'

type IconType = typeof TbShield | typeof TbShieldOff

type BaseEmailPillProps = {
  title: string
  IconComponent: IconType
}

const BaseEmailPill = ({ title, IconComponent }: BaseEmailPillProps) => (
  <Pill className="flex flex-row items-center rounded-xl text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
    <IconComponent className="mr-1" />
    <Text type="span" size="xs" weight="medium" className="">
      {title}
    </Text>
  </Pill>
)

export const EmailMaskedPill = () => (
  <BaseEmailPill title="Masked" IconComponent={TbShield} />
)

export const EmailUnmaskedPill = () => (
  <BaseEmailPill title="Unmasked" IconComponent={TbShieldOff} />
)
