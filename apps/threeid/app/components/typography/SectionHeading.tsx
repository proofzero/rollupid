import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export type SectionHeadingProps = {
  className?: string;
  children: string;
};

const SectionHeading = ({ children, className }: SectionHeadingProps) => {
  return (
    <Text
      className={className}
      weight={TextWeight.Medium500}
      size={TextSize.Base}
      color={TextColor.Gray600}
    >
      {children}
    </Text>
  );
};

export default SectionHeading;
