import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export type HeadingProps = {
  className?: string
  children: any
}

const Heading = ({ children, className }: HeadingProps) => {
  return (
    <Text className={`${className} text-gray-800`} weight="semibold" size="4xl">
      {children}
    </Text>
  )
}

export default Heading
