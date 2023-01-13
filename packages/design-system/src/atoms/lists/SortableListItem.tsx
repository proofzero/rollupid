import { useSortable } from '@dnd-kit/sortable'
import React, { Key, ReactNode } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { RxDragHandleDots2 } from 'react-icons/rx'

export type SortableListItemProps = {
  children: ReactNode
  id: Key
}

export const SortableListItem = ({ id, children }: SortableListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

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
      <button
        className="text-gray-400 mr-[14px]"
        type="button"
        {...attributes}
        {...listeners}
      >
        <RxDragHandleDots2 size={22} />{' '}
      </button>

      <div className="flex flex-1">{children}</div>
    </div>
  )
}
