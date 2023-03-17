import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export type SectionHeadingSubtleProps = {
  className?: string
  subtitle?: string
  title: string
}

const SectionHeadingSubtle = ({
  title,
  subtitle,
  className,
}: SectionHeadingSubtleProps) => {
  let cleanedClassName = className?.replace('mb-3', '') || ''
  cleanedClassName += ' py-3'

  return (
    <div className={cleanedClassName}>
      <Text className="mb-1 text-gray-400" weight="medium" size="sm">
        {title.toUpperCase()}
      </Text>

      {subtitle && (
        <Text className="text-gray-400" weight="normal" size="sm">
          {subtitle}
        </Text>
      )}
    </div>
  )
}

export default SectionHeadingSubtle
