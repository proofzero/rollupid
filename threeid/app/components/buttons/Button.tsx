import { ButtonSize, buttonSizeDict, ButtonType, buttonTypeDict } from ".";

import Text from "../typography/Text";

export type ButtonProps = {
  children: string;

  type?: ButtonType;
  size?: ButtonSize;

  onClick: () => void;

  disabled?: boolean;
};

const Button = ({
  onClick,
  children,
  type = ButtonType.Primary,
  size = ButtonSize.Base,
}: ButtonProps) => {
  return (
    <button
      className={`button-base ${buttonTypeDict[type].className} ${buttonSizeDict[size].className}`}
      onClick={onClick}
    >
      <Text
        type="span"
        size={buttonSizeDict[size].textSize}
        color={buttonTypeDict[type].textColor}
        weight={buttonSizeDict[size].textWeight}
      >
        {children}
      </Text>
    </button>
  );
};

export default Button;
