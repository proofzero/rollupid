import React from 'react'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

type AuthButtonProps = {
  Graphic?: JSX.Element
  Addon?: JSX.Element
  text: string
  disabled?: boolean
  onClick: any
  fullSize?: boolean
  displayContinueWith?: boolean
}

export const AuthButton = ({
  Graphic,
  Addon,
  text,
  disabled,
  onClick,
  fullSize = true,
  displayContinueWith = false,
}: AuthButtonProps) => (
  <Button
    className="button w-full hover:bg-gray-100"
    btnType="secondary-alt"
    disabled={disabled}
    onClick={onClick}
  >
    <div
      className={`flex ${
        fullSize ? 'justify-start' : 'justify-center'
      } items-center w-full py-1.5 space-x-3`}
    >
      {Graphic && (
        <div
          className="w-5 h-5
        flex justify-center items-center overflow-hidden
        shrink-0"
        >
          {Graphic}
        </div>
      )}

      {fullSize && (
        <Text weight="medium" className="text-gray-800 truncate">
          {`${displayContinueWith ? 'Continue with ' : ''}${text}`}
        </Text>
      )}

      {Addon}
    </div>
  </Button>
)
