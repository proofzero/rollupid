import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import React from 'react'
import { ReactNode } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { RxDragHandleDots2 } from 'react-icons/rx'

export type SortableListProps = {
  items: string[]
}

const SortableListItem = ({ id, ...rest }) => {
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
      <div className={`flex flex-row items-center w-full truncate`}>
        <button
          className="text-gray-400"
          type="button"
          {...attributes}
          {...listeners}
        >
          <RxDragHandleDots2 size={22} className="mr-[14px]" />{' '}
        </button>

        <div>Fubar</div>
      </div>
    </div>
  )
}

export const SortableList = ({ items }: SortableListProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragCancel = () => {}

  const handleDragStart = ({ active }: { active: any }) => {}

  const handleDragEnd = (event: any) => {}

  return (
    <section className="flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item, index) => item)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((i) => (
            <SortableListItem key={i} id={i} />
          ))}
        </SortableContext>
      </DndContext>
    </section>
  )
}
