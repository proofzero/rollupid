import React, { Key, ReactNode } from 'react'

export type ListItemProps = {
  children: ReactNode
  id: Key
  disabled?: boolean
}

export const ListItem = ({ id, children, disabled = false }: ListItemProps) => {
  return (
    <div
      key={id}
      className={`
               border border-gray-300 rounded-md
                py-3 mb-3 bg-white
                flex flex-row items-center justify-between
                ${disabled ? 'bg-gray-100' : ''}
                 `}
    >
      <button className="text-gray-400 mr-[14px]" type="button"></button>

      <div className="flex flex-1">{children}</div>
    </div>
  )
}
