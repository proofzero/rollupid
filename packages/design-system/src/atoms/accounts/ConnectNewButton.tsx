import React from 'react'
import { Button } from '../buttons/Button'
import { TbCirclePlus } from 'react-icons/tb'

export const ConnectNewAccountButton = ({
  phrase,
  onConnectNew,
  className,
}: {
  phrase: string
  onConnectNew: () => void
  className?: string
}) => {
  return (
    <Button
      btnType="secondary-alt"
      onClick={onConnectNew}
      className={`w-full flex flex-row items-center gap-3 justify-center p-2 ${className} dark:text-white`}
    >
      <TbCirclePlus size={18} />
      {phrase}
    </Button>
  )
}
