import type { TextProps } from '@kubelt/design-system/src/atoms/text/Text'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

const SmallRegularBlock = ({ children, className, type = 'p' }: TextProps) => {
  return (
    <Text className={className} weight="normal" size="sm" type={type}>
      {children}
    </Text>
  )
}

export default SmallRegularBlock
