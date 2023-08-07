import React from 'react'
import { Text } from '../text/Text'
import { HiChevronRight } from 'react-icons/hi'

type BreadcrumbsProps = {
  trail: {
    label: string
    href?: string
  }[]
  LinkType: any & {
    to: string
  }
}

export default ({ trail, LinkType }: BreadcrumbsProps) => (
  <>
    <div className="flex flex-row items-center gap-4">
      {trail.map(({ label, href }, index) => (
        <div key={index}>
          {href && (
            <LinkType to={href}>
              <Text size="sm" weight="medium" className="text-indigo-500">
                {label}
              </Text>
            </LinkType>
          )}
          {!href && (
            <Text size="sm" weight="medium" className="text-gray-500">
              {label}
            </Text>
          )}

          {index < trail.length - 1 && (
            <HiChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  </>
)
