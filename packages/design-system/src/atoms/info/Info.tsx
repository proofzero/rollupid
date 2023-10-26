import React from 'react'
import iIcon from './i.svg'
import { Tooltip } from 'flowbite-react'

export default function Info({
  name,
  description,
  placement = 'bottom',
}: {
  name: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <div className="w-fit flex-shrink-0">
      <Tooltip
        arrow={false}
        content={description}
        className="!bg-white !text-gray-500 !dark:text-white shadow absolute z-5 w-max"
        placement={placement}
      >
        <img src={iIcon} alt={`${name} info`} />
      </Tooltip>
    </div>
  )
}
