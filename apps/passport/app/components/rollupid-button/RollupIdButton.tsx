import type { ButtonProps } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'

import logo from '../../assets/rollup-id-logo-white.svg'

export type RollupIdButtonProps = {
  href: string
  text?: string
} & ButtonProps

export function RollupIdButton({
  href,
  text = 'Private Login',
  ...props
}: RollupIdButtonProps) {
  return (
    <Button
      onClick={() => {
        window.location.href = href
      }}
      className="flex flex-row gap-4 items-center justify-center"
      {...props}
    >
      <img src={logo} style={{ maxWidth: 24 }} alt="logo" />

      {text}
    </Button>
  )
}
