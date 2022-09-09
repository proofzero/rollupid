import Text, {
  TextColor,
  TextProps,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export type SectionTitleProps = {
  className?: string;
  children: any;
};

const SectionTitle = ({ children, className }: SectionTitleProps) => {
  return (
    <Text
      className={className}
      weight={TextWeight.SemiBold600}
      size={TextSize.XL}
      color={TextColor.Gray800}
    >
      {children}
    </Text>
  );
};

export default SectionTitle;
