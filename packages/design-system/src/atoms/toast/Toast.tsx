import React from 'react'
import { Text } from '../text/Text'

export type ToastProps = {
  message: string
  className?: string
  PreMessage?: JSX.Element
  PostMessage?: JSX.Element
}

export const Toast = ({
  message,
  className,
  PreMessage,
  PostMessage,
}: ToastProps) => (
  <div
    className={`flex flex-row items-center p-4 pr-6 space-x-3 rounded-md ${
      className ?? ''
    }`}
  >
    {PreMessage && <div>{PreMessage}</div>}
    <Text className="flex-1">{message}</Text>{' '}
    {PostMessage && <div>{PostMessage}</div>}
  </div>
)
