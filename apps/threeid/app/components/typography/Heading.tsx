import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export type HeadingProps = {
  className?: string
  children: string
}

const Heading = ({ children, className }: HeadingProps) => {
  return (
    <Text className={`${className} text-gray-800`} weight="medium" size="4xl">
      {children}
    </Text>
  )
}

export default Heading
