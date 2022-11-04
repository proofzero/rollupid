import { Link } from '@remix-run/react'
import { IconType } from 'react-icons/lib'

import { ButtonSize, buttonSizeDict, ButtonType, buttonTypeDict } from '.'

import Text from '../typography/Text'

type ButtonLinkProps = {
  children: string

  type?: ButtonType
  size?: ButtonSize

  Icon?: IconType
  iconColor?: string

  to: string

  disabled?: boolean
}

const ButtonLink = ({
  to,
  children,
  type = ButtonType.Secondary,
  size = ButtonSize.Base,
  Icon,
  iconColor,
}: ButtonLinkProps) => {
  return (
    <Link
      className={`button-base ${buttonTypeDict[type].className} ${buttonSizeDict[size].className} rounded-md`}
      to={to}
    >
      <Text
        type="span"
        size={buttonSizeDict[size].textSize}
        color={buttonTypeDict[type].textColor}
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
    </Link>
  )
}

export default ButtonLink
