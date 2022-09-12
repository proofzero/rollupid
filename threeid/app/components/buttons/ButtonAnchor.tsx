import { FaTwitter } from "react-icons/fa";
import { IconType } from "react-icons/lib";

import { ButtonSize, buttonSizeDict, ButtonType, buttonTypeDict } from ".";

import Text from "../typography/Text";

type ButtonAnchorProps = {
  children: string;

  type?: ButtonType;
  size?: ButtonSize;

  Icon?: IconType;
  iconColor?: string;

  href: string;

  disabled?: boolean;
};

const ButtonAnchor = ({
  href,
  children,
  type = ButtonType.Secondary,
  size = ButtonSize.Base,
  Icon,
  iconColor,
}: ButtonAnchorProps) => {
  return (
    <a
      className={`button-base ${buttonTypeDict[type].className} ${buttonSizeDict[size].className}`}
      href={href}
      target="_blank"
    >
      {Icon && (
        <Icon
          style={{
            width: 19.82,
            height: 15.11,
            marginRight: 13.09,
            color: iconColor ? iconColor : "default",
          }}
        />
      )}

      <Text
        type="span"
        size={buttonSizeDict[size].textSize}
        color={buttonTypeDict[type].textColor}
        weight={buttonSizeDict[size].textWeight}
      >
        {children}
      </Text>
    </a>
  );
};

export default ButtonAnchor;
