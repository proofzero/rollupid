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
import React, { Key, ReactNode, useState } from 'react'

import { SortableListItem } from './SortableListItem'

type SortableItem = {
  key: Key
  val: any
}

export type SortableListProps<T extends SortableItem> = {
  items: T[]
  itemRenderer: (item: T) => ReactNode
  onItemsReordered?: (reorderedItems: T[]) => void
}

export const SortableList = <T extends SortableItem>({
  items,
  itemRenderer,
  onItemsReordered,
}: SortableListProps<T>) => {
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

        const newArray = arrayMove(itemList, oldIndex, newIndex)

        if (onItemsReordered) {
          onItemsReordered(newArray)
        }

        return newArray
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
            <SortableListItem key={item.key} id={item.key}>
              {itemRenderer(item)}
            </SortableListItem>
          ))}
        </SortableContext>
      </DndContext>
    </section>
  )
}
