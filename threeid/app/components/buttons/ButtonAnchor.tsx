import { ButtonSize, buttonSizeDict, ButtonType, buttonTypeDict } from ".";
import Text from "../typography/Text";

type ButtonAnchorProps = {
  children: string;

  type?: ButtonType;
  size?: ButtonSize;

  href: string;

  disabled?: boolean;
};

const ButtonAnchor = ({
  href,
  children,
  type = ButtonType.Secondary,
  size = ButtonSize.Base,
}: ButtonAnchorProps) => {
  return (
    <a
      className={`button-base ${buttonTypeDict[type].className} ${buttonSizeDict[size].className}`}
      href={href}
      target="_blank"
    >
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
