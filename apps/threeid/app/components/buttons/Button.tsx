import { IconType } from 'react-icons'
import { ButtonSize, buttonSizeDict, ButtonType, buttonTypeDict } from '.'

import Text from '../typography/Text'

export type ButtonProps = {
  children: string

  type?: ButtonType
  size?: ButtonSize

  isSubmit?: boolean

  onClick?: () => void

  disabled?: boolean

  Icon?: IconType
  iconColor?: string
}

const Button = ({
  onClick,
  children,
  type = ButtonType.Primary,
  isSubmit = false,
  size = ButtonSize.Base,
  disabled,
  Icon,
  iconColor,
}: ButtonProps) => {
  const computedType = disabled ? ButtonType.Disabled : type

  return (
    <button
      disabled={disabled}
      className={`button-base ${buttonTypeDict[computedType].className} ${buttonSizeDict[size].className} w-full lg:w-fit rounded-md`}
      onClick={onClick}
      type={isSubmit ? 'submit' : 'button'}
    >
      <Text
        type="span"
        size={buttonSizeDict[size].textSize}
        color={buttonTypeDict[computedType].textColor}
        weight={buttonSizeDict[size].textWeight}
      >
        <span className="flex flex-row justify-center items-center">
          {Icon && (
            <Icon
              style={{
                width: 19.82,
                height: 15.11,
                marginRight: 13.09,
                color: iconColor ? iconColor : 'default',
              }}
            />
          )}

          {children}
        </span>
      </Text>
    </button>
  )
}

export default Button
