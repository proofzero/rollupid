import React from 'react'
import {
  Button,
  ButtonProps,
} from '@kubelt/design-system/src/atoms/buttons/Button'

export type AuthButtonProps = {
  logo?: string
} & ButtonProps

export function AuthButton({ logo, children, ...props }: AuthButtonProps) {
  return (
    <Button
      className="flex flex-row gap-4 items-center justify-center"
      {...props}
    >
      {logo && <img src={logo} style={{ maxWidth: 24 }} alt="logo" />}

      {children}
    </Button>
  )
}
