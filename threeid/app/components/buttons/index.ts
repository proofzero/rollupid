import { TextColor, TextSize, TextWeight } from "../typography/Text";
import buttonStyles from "./Button.css";

import Button from "./Button";
import ButtonAnchor from "./ButtonAnchor";

export const links = () => [{ rel: "stylesheet", href: buttonStyles }];

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
};

export { Button, ButtonAnchor };
