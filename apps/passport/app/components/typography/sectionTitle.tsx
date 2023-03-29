import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export type SectionTitleProps = {
  className?: string
  subtitle?: string
  title: string
}

const SectionTitle = ({ className, title, subtitle }: SectionTitleProps) => {
  let cleanedClassName = className?.replace('mb-3', '') || ''
  cleanedClassName += ' mb-3'

  return (
    <div className={cleanedClassName}>
      <Text className="text-gray-800" weight="semibold" size="xl">
        {title}
      </Text>

      {subtitle && (
        <Text weight="normal" size="sm" className="text-gray-400">
          {subtitle}
        </Text>
      )}
    </div>
  )
}

export default SectionTitle
