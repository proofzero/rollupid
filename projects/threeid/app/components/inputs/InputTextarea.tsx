import { useEffect, useState } from "react";
import Text, { TextColor, TextSize, TextWeight } from "../typography/Text";

export type InputTextareaProps = {
  id?: string;
  heading: string;
  onChange: (val: any) => void;
  rows?: number;
  charLimit?: number;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
};

const InputTextarea = ({
  id,
  onChange,
  rows,
  heading,
  charLimit,
  name,
  placeholder,
  defaultValue,
  disabled,
  error,
}: InputTextareaProps) => {
  const computedName = name ?? id;

  const [val, setVal] = useState<undefined | string>(defaultValue);
  const [computedError, setComputedError] = useState<undefined | boolean>();

  useEffect(() => {
    if (error || (val && charLimit && val.length > charLimit)) {
      setComputedError(true);
    } else {
      setComputedError(false);
    }
  }, [error, val]);

  return (
    <div>
      <label htmlFor={id} className="flex flex-row justify-between">
        <Text
          size={TextSize.SM}
          weight={TextWeight.Medium500}
          color={computedError ? TextColor.Red500 : TextColor.Gray700}
        >
          {heading}
        </Text>

        {charLimit && (
          <Text
            size={TextSize.SM}
            weight={TextWeight.Medium500}
            color={TextColor.Gray400}
          >
            {val?.length || 0}/{charLimit}
          </Text>
        )}
      </label>

      <div className="mt-1 text-base flex">
        <div
          className={`relative text-${
            computedError ? "red" : "gray"
          }-900 flex flex-1`}
        >
          <textarea
            name={computedName}
            id={id}
            onChange={(e) => {
              setVal(e.target.value);

              if (charLimit && e.target.value.length > charLimit) {
                onChange(e.target.value.substring(0, charLimit));
              } else {
                onChange(e.target.value);
              }
            }}
            rows={rows}
            defaultValue={defaultValue}
            disabled={disabled ?? false}
            className={`border-${
              computedError ? "red-500" : "gray-300"
            } shadow-sm focus:border-${
              computedError ? "red" : "indigo"
            }-500 focus:ring-${
              computedError ? "red" : "indigo"
            }-500 disabled:cursor-not-allowed disabled:border-${
              computedError ? "red" : "gray"
            }-200 disabled:bg-${
              computedError ? "red" : "gray"
            }-50 placeholder-${computedError ? "red" : "gray"}-400 w-full`}
            style={{
              fontWeight: 400,
              fontFamily: "Inter_400Regular",
            }}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
};

export default InputTextarea;
