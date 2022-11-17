import React, { ReactNode } from 'react'
import { Button, ButtonProps } from '@kubelt/design-system'

import threeIdLogo from './3id.svg'

export type ThreeIdButtonProps = {
  href: string
  text: string
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
      className={'flex flex-row gap-4'}
      size={'lg'}
    >
      <span className={''}>
        <img src={threeIdLogo} />
      </span>
      {text}
    </Button>
  )
}
