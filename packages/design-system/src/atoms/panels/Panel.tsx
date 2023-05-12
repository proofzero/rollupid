import React from 'react'
import { Text } from '../text/Text'
import { ExperimentalFeaturePill } from '../pills/ExperimentalFeaturePill'

type PanelProps = {
  title: string
  titleCompanion?: React.ReactNode
  children: React.ReactNode
  experimental?: boolean
}

export const Panel = ({
  title,
  titleCompanion,
  children,
  experimental,
}: PanelProps) => (
  <div className="bg-white rounded-lg py-2.5 px-6 pb-7 flex flex-col space-y-4 h-full border shadow">
    <section className="flex-1 flex justify-between items-start">
      <div className="flex items-center">
        <Text size="lg" weight="semibold" className="text-gray-900 pr-2">
          {title}
        </Text>
        {experimental && (
          <ExperimentalFeaturePill
            className="bg-gray-100"
            text="Experimental Feature"
          />
        )}
      </div>

      {titleCompanion}
    </section>

    <section className="h-full flex">
      <div className="w-full">{children}</div>
    </section>
  </div>
)
