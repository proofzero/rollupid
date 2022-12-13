import React from 'react'
import { Text } from '../text/Text'

type PanelProps = {
  title: string
  titleCompanion?: React.ReactNode
  children: React.ReactNode
}

export const Panel = ({ title, titleCompanion, children }: PanelProps) => (
  <div className="bg-white rounded-lg py-2.5 px-6 flex flex-col space-y-4">
    <section className="flex-1 flex justify-between items-start">
      <Text size="lg" weight="semibold" className="text-gray-900">
        {title}
      </Text>

      {titleCompanion}
    </section>

    <section>{children}</section>
  </div>
)
