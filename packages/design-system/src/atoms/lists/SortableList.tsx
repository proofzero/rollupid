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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import React from 'react'
import { KeyedItem, SortableListItem } from './SortableListItem'

export type SortableListProps = {
  items: KeyedItem[]
  handleDragCancel: () => void
  handleDragStart: ({ active }: { active: any }) => void
  handleDragEnd: (event: any) => void
}

export const SortableList = ({
  handleDragCancel,
  handleDragStart,
  handleDragEnd,
  items,
}: SortableListProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
          items={items.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableListItem>{item}</SortableListItem>
          ))}
        </SortableContext>
      </DndContext>
    </section>
  )
}
