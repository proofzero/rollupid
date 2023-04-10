import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

type AuthButtonProps = {
  Graphic?: JSX.Element
  Addon?: JSX.Element
  text: string
  disabled?: boolean
  onClick: any
}

export default ({
  Graphic,
  Addon,
  text,
  disabled,
  onClick,
}: AuthButtonProps) => (
  <Button
    btnType="secondary-alt"
    className="button w-full"
    disabled={disabled}
    onClick={onClick}
  >
    <div className="flex flex-row items-center space-x-3 py-1.5">
      {Graphic && (
        <div className="w-6 h-6 flex justify-center items-center overflow-hidden">
          {Graphic}
        </div>
      )}

      <Text weight="medium" className="text-gray-800">
        {text}
      </Text>

      {Addon}
    </div>
  </Button>
)
