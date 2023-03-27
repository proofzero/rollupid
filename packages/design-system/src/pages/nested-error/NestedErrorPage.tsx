import React from 'react'
import { Text } from '../../atoms/text/Text'
import nestedError from '../../assets/nested-error.svg'

export const NestedErrorPage = ({ text }: { text: string }) => {
  return (
    <div
      className="flex justify-center items-center h-full
          bg-white rounded-lg border flex-col shadow"
    >
      <img src={nestedError} alt="Something went wrong..." className="my-6" />
      <Text className="text-gray-400">{text}</Text>
    </div>
  )
}
