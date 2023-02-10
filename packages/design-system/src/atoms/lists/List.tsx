import React, { Key, ReactNode } from 'react'
import { ListItem } from './ListItem'

type ListItem = {
  key: Key
  val: any
  disabled?: boolean
}

export type ListProps<T extends ListItem> = {
  items: T[]
  itemRenderer: (item: T) => ReactNode
}

export const List = <T extends ListItem>({
  items,
  itemRenderer,
}: ListProps<T>) => {
  return (
    <section className="flex flex-col">
      {items.map((item) => (
        <ListItem key={item.key} id={item.key} disabled={item.disabled}>
          {itemRenderer(item)}
        </ListItem>
      ))}
    </section>
  )
}
