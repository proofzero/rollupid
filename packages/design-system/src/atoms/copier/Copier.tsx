import React from 'react'

import { FiCopy } from 'react-icons/fi'

export type CopierProps = {
  value: string
  visible?: boolean
  onCopy?: (value: string) => void
}
export const Copier = ({ value, visible = true, onCopy }: CopierProps) => {
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
      className="cursor-pointer text-indigo-500"
    />
  ) : null
}
