import React from 'react'

import { FiCopy } from 'react-icons/fi'

export type CopierProps = {
  value: string
  color?: string
  visible?: boolean
  onCopy?: (value: string) => void
}
export const Copier = ({
  value,
  visible = true,
  color = 'text-indigo-500',
  onCopy,
}: CopierProps) => {
  return visible ? (
    <FiCopy
      onClick={() => {
        if (!navigator) {
          console.warn('Copying is not available')

          return
        }

        navigator.clipboard.writeText(value)

        if (onCopy) {
          onCopy(value)
        }
      }}
      className={`cursor-pointer ${color}`}
    />
  ) : null
}
