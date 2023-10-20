import classNames from 'classnames'
import React, { Key, ReactNode } from 'react'

export type ListItemProps = {
  children: ReactNode
  id: Key
  onClick?: (id: Key) => void
  disabled?: boolean
  colorCode?: string
}

export const ListItem = ({
  id,
  children,
  disabled = false,
  onClick,
  colorCode,
}: ListItemProps) => {
  return (
    <div
      key={id}
      className="border border-gray-300 rounded-md mb-2 shadow-sm truncate"
    >
      <div
        className={classNames(
          `py-[0.625rem] bg-white
                flex flex-row items-center justify-between
                px-4 truncate`,
          {
            'border-l-4 rounded-[5px]': colorCode != null,
            'bg-gray-100': disabled === true,
            'cursor-pointer hover:bg-[#F3F4F6]': onClick != null,
          }
        )}
        style={{
          ...(colorCode != null ? { borderLeftColor: colorCode } : {}),
        }}
        onClick={() => onClick && onClick(id)}
      >
        <div className="flex flex-1 truncate">{children}</div>
      </div>
    </div>
  )
}
