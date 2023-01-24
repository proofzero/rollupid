import React, { Children } from 'react'
import {
  Button,
  ButtonProps,
} from '@kubelt/design-system/src/atoms/buttons/Button'

export type AuthButtonProps = {
  logo?: string
} & ButtonProps

export function AuthButton({ logo, children, ...props }: AuthButtonProps) {
  return (
    <Button className="flex flex-row gap-4 items-center" {...props}>
      {logo && <img src={logo} />}

      {children}
    </Button>
  )
}
