import React from 'react'
import { Text } from '../text/Text'
import { Pill } from './Pill'
import { TbFlask } from 'react-icons/tb'

export type ExperimentalFeaturePillProps = {
  text: string
  className?: string
}

export const ExperimentalFeaturePill = ({
  text,
  className,
}: ExperimentalFeaturePillProps) => (
  <Pill
    className={`${
      className ? className : ''
    } text-gray-600 flex flex-row space-x-2 rounded-xl`}
  >
    <TbFlask className="inline" />
    <Text size="xs">{text}</Text>
  </Pill>
)
