import React, { ReactNode, useState, useEffect } from 'react'
import {
  Button,
  ButtonProps,
} from '@kubelt/design-system/src/atoms/button/Button'

import threeIdLogo from './3id.svg'

export type ThreeIdButtonProps = {
  href: string
} & ButtonProps

export function ThreeIdButton({ href }: ThreeIdButtonProps) {
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
      Private Login
    </Button>
  )
}
