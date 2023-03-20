import React from 'react'
import { Text } from '../text/Text'

import { IoMdClose } from 'react-icons/io'

export type ToastMessageProps = {
  message: string
}

type ToastProps = ToastMessageProps & {
  className?: string
  PreMessage?: JSX.Element
  PostMessage?: JSX.Element
}

export const Toast = ({
  message,
  remove,
  className,
  PreMessage,
  PostMessage,
}: ToastProps & { remove: () => void }) => (
  <div
    className={`flex flex-row items-center p-4 pr-6 space-x-3 rounded-md ${
      className ?? ''
    }`}
  >
    {PreMessage && <div>{PreMessage}</div>}
    <Text className="flex-1">{message}</Text>{' '}
    {PostMessage && <div>{PostMessage}</div>}
    <button
      onClick={() => {
        remove()
      }}
    >
      <IoMdClose size={16} />
    </button>
  </div>
)
