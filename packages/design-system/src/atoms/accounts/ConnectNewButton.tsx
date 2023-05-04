import React from 'react'
import { Button } from '../buttons/Button'
import { TbCirclePlus } from 'react-icons/tb'

export const ConnectNewAccountButton = ({
  phrase,
  onClick,
}: {
  phrase: string
  onClick: () => void
}) => {
  return (
    <Button
      btnType="secondary-alt"
      onClick={onClick}
      className="w-full flex flex-row items-center gap-3 justify-center p-2"
    >
      <TbCirclePlus />
      {phrase}
    </Button>
  )
}
