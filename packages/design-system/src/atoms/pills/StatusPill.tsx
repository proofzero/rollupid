import React from 'react'
import classNames from 'classnames'
import { Pill } from './Pill'
import { Text } from '../text/Text'

export type StatusPillProps = {
  text?: string
  status: 'success' | 'warning' | 'danger'
}

export const StatusPill = ({ text, status }: StatusPillProps) => (
  <Pill className="bg-gray-100 flex flex-row items-center rounded-xl">
    <div
      className={classNames(`w-2 h-2 rounded-full mr-2`, {
        'bg-green-500': status === 'success',
        'bg-orange-500': status === 'warning',
        'bg-red-500': status === 'danger',
      })}
    ></div>
    {text && (
      <Text size="xs" weight="medium" className="text-gray-700">
        {text}
      </Text>
    )}
  </Pill>
)
