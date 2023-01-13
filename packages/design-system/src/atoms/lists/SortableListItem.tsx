import { useSortable } from '@dnd-kit/sortable'
import React, { JSXElementConstructor, Key, ReactElement } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { RxDragHandleDots2 } from 'react-icons/rx'

export type KeyedItem = Required<
  ReactElement<any, string | JSXElementConstructor<any>>
>

export type SortableListItemProps = {
  children: KeyedItem
}

export const SortableListItem = ({ children }: SortableListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: children.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={`
               border border-gray-300 rounded-md
                px-4 py-3 mb-3 truncate bg-white
                flex flex-row items-center justify-between
                ${isDragging ? 'shadow-inner z-100' : ''}
                 `}
      ref={setNodeRef}
      style={style}
    >
      <div className={`flex flex-row items-center w-full truncate`}>
        <button
          className="text-gray-400 mr-[14px]"
          type="button"
          {...attributes}
          {...listeners}
        >
          <RxDragHandleDots2 size={22} />{' '}
        </button>

        <div>{children}</div>
      </div>
    </div>
  )
}
