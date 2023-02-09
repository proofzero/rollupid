import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import logo from './rollup-purple.svg'

export type RollupIdButtonProps = {
  href: string
  text?: string
} & ButtonProps

export function RollupIdButton({
  href,
  text = 'Private Login',
}: RollupIdButtonProps) {
  return (
    <Button
      onClick={() => {
        window.location.href = href
      }}
      className="flex flex-row gap-4 items-center"
      btnSize="l"
    >
      <img src={logo} alt="logo" />

      {text}
    </Button>
  )
}
