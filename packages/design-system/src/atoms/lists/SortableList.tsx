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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import React, { useState } from 'react'
import { KeyedItem, SortableListItem } from './SortableListItem'

export type SortableListProps = {
  items: KeyedItem[]
}

export const SortableList = ({ items }: SortableListProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [itemList, setItemList] = useState(items)

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItemList((itemList) => {
        const oldIndex = itemList.findIndex((el) => el.key === active.id)
        const newIndex = itemList.findIndex((el) => el.key === over.id)

        return arrayMove(itemList, oldIndex, newIndex)
      })
    }
  }

  return (
    <section className="flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemList.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          {itemList.map((item) => (
            <SortableListItem key={item.key}>{item}</SortableListItem>
          ))}
        </SortableContext>
      </DndContext>
    </section>
  )
}
