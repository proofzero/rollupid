import React from 'react'
import { Text } from '../text/Text'

export type UserPillProps = {
  avatarURL: string
  text: string
  size?: number
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export default ({
  avatarURL,
  text,
  size = 64,
  ...buttonProps
}: UserPillProps) => (
  <button
    {...buttonProps}
    className="w-fit inline-block rounded py-0.5 pr-2.5 bg-white flex flex-row items-center rounded-full gap-2 pl-1 border border-gray-200 hover:border-indigo-500 focus:border-indigo-500 focus:bg-indigo-50"
  >
    <img
      src={avatarURL}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />

    <Text size="sm" weight="medium" className="text-gray-500">
      {text}
    </Text>
  </button>
)
