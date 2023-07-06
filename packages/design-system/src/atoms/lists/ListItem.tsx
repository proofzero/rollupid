import classNames from 'classnames'
import React, { Key, ReactNode } from 'react'

export type ListItemProps = {
  children: ReactNode
  id: Key
  onClick?: (id: Key) => void
  disabled?: boolean
}

export const ListItem = ({
  id,
  children,
  disabled = false,
  onClick,
}: ListItemProps) => {
  return (
    <div
      key={id}
      className={classNames(
        `border border-gray-300 rounded-md
                py-2 mb-3 bg-white
                flex flex-row items-center justify-between
                shadow-sm px-4`,
        {
          'bg-gray-100': disabled === true,
          'cursor-pointer hover:bg-[#F3F4F6]': onClick != null,
        }
      )}
      onClick={() => onClick && onClick(id)}
    >
      <div className="flex flex-1">{children}</div>
    </div>
  )
}
