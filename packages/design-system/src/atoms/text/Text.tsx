import React, { HTMLAttributes } from "react";

import classNames from 'classnames'

type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
type TextWeight = "normal" | "medium" | "semibold" | "bold"
type TextType = "p" | "span"

export type TextProps = HTMLAttributes<HTMLElement> & {
    size?: TextSize,
    weight?: TextWeight,
    type?: TextType,
}

const Text = ({
    size = "base",
    weight = "normal",
    type = "span",
    className,
    children,
    ...rest
}: TextProps) => {
    return React.createElement(type, {
        className: classNames(`font-${weight}`, `text-${size}`, className),
        ...rest
    }, children)
};

export default Text;
