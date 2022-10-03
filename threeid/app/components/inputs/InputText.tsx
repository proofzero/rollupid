import { IconType } from "react-icons/lib";
import Text, { TextColor, TextSize, TextWeight } from "../typography/Text";

type InputTextValType = string | number;
type InputIconPosType = "leading" | "trailing";

export type InputTextProps = {
  id?: string;
  heading: string;
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  defaultValue?: InputTextValType;
  disabled?: boolean;
  Icon?: IconType;
  iconPosition?: InputIconPosType;
  error?: boolean;
};

const InputText = ({
  id,
  heading,
  name,
  type,
  placeholder,
  defaultValue,
  disabled,
  Icon,
  iconPosition,
  error,
}: InputTextProps) => {
  const computedName = name ?? id;

  return (
    <div>
      <label htmlFor={id}>
        <Text
          size={TextSize.SM}
          weight={TextWeight.Medium500}
          color={error ? TextColor.Red500 : TextColor.Gray700}
        >
          {heading}
        </Text>
      </label>

      <div
        className={`relative mt-1 text-base text-${error ? "red" : "gray"}-900`}
      >
        {Icon && (
          <div
            style={{
              // Seems to be a problem with the `pr-3` class not adding padding
              paddingRight: iconPosition === "trailing" ? "0.75rem" : 0,
            }}
            className={`text-${
              error ? "red" : "gray"
            }-400 pointer-events-none absolute inset-y-0 ${
              iconPosition === "trailing" ? "right-0" : "left-0"
            } flex items-center p${iconPosition === "trailing" ? "r" : "l"}-3`}
          >
            <Icon
              style={{
                width: 15,
                height: 15,
                fontWeight: 400,
              }}
            />
          </div>
        )}

        <input
          type={type ?? "text"}
          name={computedName}
          id={id}
          defaultValue={defaultValue}
          disabled={disabled ?? false}
          className={`rounded-md border-${
            error ? "red" : "gray"
          }-300 shadow-sm focus:border-${
            error ? "red" : "indigo"
          }-500 focus:ring-${
            error ? "red" : "indigo"
          }-500 disabled:cursor-not-allowed disabled:border-${
            error ? "red" : "gray"
          }-200 disabled:bg-${error ? "red" : "gray"}-50 placeholder-${
            error ? "red" : "gray"
          }-400 ${
            Icon ? `p${iconPosition === "trailing" ? "r" : "l"}-10` : ""
          }`}
          style={{
            fontWeight: 400,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputText;
