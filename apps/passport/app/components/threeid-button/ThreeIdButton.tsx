import {
  Button,
  ButtonProps,
} from '@kubelt/design-system/src/atoms/buttons/Button'

import threeIdLogo from './3id.svg'

export type ThreeIdButtonProps = {
  href: string
  text?: string
} & ButtonProps

export function ThreeIdButton({
  href,
  text = 'Private Login',
}: ThreeIdButtonProps) {
  return (
    <Button
      onClick={() => {
        window.location.href = href
      }}
      className="flex flex-row gap-4 items-center"
      btnSize="l"
    >
      <img src={threeIdLogo} />

      {text}
    </Button>
  )
}
