import React from 'react'
import { ReactNode } from 'react'

export type SortableListProps = {
  items: ReactNode[]
}

export const SortableList = ({ items }: SortableListProps) => {
  return (
    <section className="flex flex-col space-y-2">
      {items.map((i, index) => (
        <article
          key={index}
          className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white p-4 w-full"
        >
          {i}
        </article>
      ))}
    </section>
  )
}
