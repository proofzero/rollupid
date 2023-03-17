import type { TextProps } from '@proofzero/design-system/src/atoms/text/Text'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

const SmallRegularBlock = ({ children, className, type = 'p' }: TextProps) => {
  return (
    <Text
      className={`${className} text-gray-500`}
      weight="normal"
      size="sm"
      type={type}
    >
      {children}
    </Text>
  )
}

export default SmallRegularBlock
