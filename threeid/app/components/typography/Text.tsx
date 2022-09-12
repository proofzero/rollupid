export enum TextSize {
  XS,
  SM,
  Base,
  LG,
  XL,
  XL2,
  XL3,
  XL4,
  XL5,
}

type TextSizeProps = {
  fontSize: number | string;
  lineHeight: number | string;
};

export enum TextColor {
  Gray900,
  Gray800,
  Gray700,
  Gray600,
  Gray500,
  Gray400,
  Gray300,
  Gray200,
  Gray100,
  Gray50,
  White,
}

type TextColorProps = {
  color: string;
};

export enum TextWeight {
  Regular400,
  Medium500,
  SemiBold600,
  Bold700,
}

type TextWeightProps = {
  fontFamily: string;
};

const textSizeDict: { [key in TextSize]: TextSizeProps } = {
  [TextSize.XS]: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  [TextSize.SM]: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  [TextSize.Base]: {
    fontSize: "1rem",
    lineHeight: "1.5rem",
  },
  [TextSize.LG]: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
  },
  [TextSize.XL]: {
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
  },
  [TextSize.XL2]: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
  },
  [TextSize.XL3]: {
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
  },
  [TextSize.XL4]: {
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
  },
  [TextSize.XL5]: {
    fontSize: "3rem",
    lineHeight: "3rem",
  },
};

const textColorDict: { [key in TextColor]: TextColorProps } = {
  [TextColor.Gray900]: { color: "#111827" },
  [TextColor.Gray800]: { color: "#1F2937" },
  [TextColor.Gray700]: { color: "#374151" },
  [TextColor.Gray600]: { color: "#4B5563" },
  [TextColor.Gray500]: { color: "#6B7280" },
  [TextColor.Gray400]: { color: "#9CA3AF" },
  [TextColor.Gray300]: { color: "#D1D5DB" },
  [TextColor.Gray200]: { color: "#E5E7EB" },
  [TextColor.Gray100]: { color: "#F3F4F6" },
  [TextColor.Gray50]: { color: "#F9FAFB" },
  [TextColor.White]: { color: "#FFFFFF" },
};

const textWeightDict: { [key in TextWeight]: TextWeightProps } = {
  [TextWeight.Regular400]: { fontFamily: "Inter_400Regular" },
  [TextWeight.Medium500]: { fontFamily: "Inter_500Medium" },
  [TextWeight.SemiBold600]: { fontFamily: "Inter_600SemiBold" },
  [TextWeight.Bold700]: { fontFamily: "Inter_700Bold" },
};

export type TextProps = {
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  type?: "div" | "paragraph" | "span";
  className?: string;
  children: any;
};

const Text = ({
  size = TextSize.Base,
  color = TextColor.Gray900,
  weight = TextWeight.Regular400,
  type = "paragraph",
  children,
  className,
}: TextProps) => {
  const style = {
    ...textSizeDict[size],
    ...textColorDict[color],
    ...textWeightDict[weight],
  };

  switch (type) {
    case "div":
      return (
        <div className={className} style={style}>
          {children}
        </div>
      );
    case "span":
      return (
        <span className={className} style={style}>
          {children}
        </span>
      );
    case "paragraph":
    default:
      return (
        <p className={className} style={style}>
          {children}
        </p>
      );
  }
};

export default Text;
