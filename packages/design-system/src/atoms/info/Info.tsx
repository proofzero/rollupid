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
    <Tooltip
      content={description}
      className="bg-white text-black shadow absolute z-5 w-max"
      placement={placement}
    >
      <img src={iIcon} alt={`${name} info`} />
    </Tooltip>
  )
}