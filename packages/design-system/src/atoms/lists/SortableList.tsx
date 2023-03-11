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
import React, { Key, ReactNode, useEffect, useState } from 'react'

import { SortableListItem } from './SortableListItem'

type SortableItem = {
  key: Key
  val: any
  disabled?: boolean
  isSortable?: boolean
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

  useEffect(() => {
    setItemList(items)
  }, [items])

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
          {itemList.map((item) =>
            item.isSortable || item.isSortable === undefined ? (
              <SortableListItem
                key={item.key}
                id={item.key}
                disabled={item.disabled}
              >
                {itemRenderer(item)}
              </SortableListItem>
            ) : (
              itemRenderer(item)
            )
          )}
        </SortableContext>
      </DndContext>
    </section>
  )
}
