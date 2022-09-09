import Text, { TextColor, TextSize, TextWeight } from "./Text";

type SmallRegularBlockProps = {
  children: any;
  className?: string;
  type?: "div" | "span" | "paragraph";
};

const SmallRegularBlock = ({
  children,
  className,
  type = "paragraph",
}: SmallRegularBlockProps) => {
  return (
    <Text
      className={className}
      weight={TextWeight.Regular400}
      size={TextSize.SM}
      color={TextColor.Gray500}
      type={type}
    >
      {children}
    </Text>
  );
};

export default SmallRegularBlock;
