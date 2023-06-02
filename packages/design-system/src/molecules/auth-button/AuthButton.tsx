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
    className="button w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-[#374151] dark:border-gray-600"
    btnType="secondary-alt"
    disabled={disabled}
    onClick={onClick}
  >
    <div
      className={`flex ${
        fullSize ? 'justify-start' : 'justify-center'
      } items-center w-full space-x-3 h-[36px]`}
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
        <Text
          weight="medium"
          className="text-gray-800 dark:text-white truncate"
        >
          {`${displayContinueWith ? 'Continue with ' : ''}${text}`}
        </Text>
      )}

      {Addon}
    </div>
  </Button>
)
