import Text, {
  TextColor,
  TextProps,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export type HeadingProps = {
  className?: string;
  children: string;
};

const Heading = ({ children, className }: HeadingProps) => {
  return (
    <Text
      className={className}
      weight={TextWeight.Medium500}
      size={TextSize.XL4}
      color={TextColor.Gray800}
    >
      {children}
    </Text>
  );
};

export default Heading;
