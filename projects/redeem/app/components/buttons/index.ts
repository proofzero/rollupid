import { TextColor, TextSize, TextWeight } from "../typography/Text";

import Button from "./Button";
import ButtonAnchor from "./ButtonAnchor";

export enum ButtonSize {
  XS,
  SM,
  Base,
  L,
  XL,
}

export type ButtonSizeProps = {
  className: string;

  textSize: TextSize;
  textWeight: TextWeight;
};

export const buttonSizeDict: { [key in ButtonSize]: ButtonSizeProps } = {
  [ButtonSize.XS]: {
    className: "button-size-xs",
    textSize: TextSize.XS,
    textWeight: TextWeight.Medium500,
  },
  [ButtonSize.SM]: {
    className: "button-size-sm",
    textSize: TextSize.SM,
    textWeight: TextWeight.Medium500,
  },
  [ButtonSize.Base]: {
    className: "button-size-base",
    textSize: TextSize.SM,
    textWeight: TextWeight.Medium500,
  },
  [ButtonSize.L]: {
    className: "button-size-l",
    textSize: TextSize.Base,
    textWeight: TextWeight.Medium500,
  },
  [ButtonSize.XL]: {
    className: "button-size-xl",
    textSize: TextSize.Base,
    textWeight: TextWeight.Medium500,
  },
};

export enum ButtonType {
  Primary,
  Secondary,
  Disabled,
}

export type ButtonTypeProps = {
  className: string;

  textColor: TextColor;
};

export const buttonTypeDict: { [key in ButtonType]: ButtonTypeProps } = {
  [ButtonType.Primary]: {
    className: "button-type-primary",
    textColor: TextColor.White,
  },
  [ButtonType.Secondary]: {
    className: "button-type-secondary",
    textColor: TextColor.Gray700,
  },
  [ButtonType.Disabled]: {
    className: "button-type-disabled",
    textColor: TextColor.Gray300,
  },
};

export { Button, ButtonAnchor };
