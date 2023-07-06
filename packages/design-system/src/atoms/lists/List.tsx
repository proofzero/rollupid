import React, { Key, ReactNode } from 'react'
import { ListItem } from './ListItem'

type ListItem = {
  key: Key
  val: any
  disabled?: boolean
  onClick?: (id: Key) => void
}

export type ListProps<T extends ListItem> = {
  items: T[]
  itemRenderer: (item: T) => ReactNode
  onItemClick?: (item: T) => void
}

export const List = <T extends ListItem>({
  items,
  itemRenderer,
  onItemClick,
}: ListProps<T>) => {
  return (
    <section className="flex flex-col">
      {items.map((item) => (
        <ListItem
          key={item.key}
          id={item.key}
          disabled={item.disabled}
          onClick={(key) =>
            onItemClick
              ? onItemClick(items.find((i) => i.key === key))
              : undefined
          }
        >
          {itemRenderer(item)}
        </ListItem>
      ))}
    </section>
  )
}
