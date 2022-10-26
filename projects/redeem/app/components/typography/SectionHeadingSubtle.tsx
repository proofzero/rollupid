import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export type SectionHeadingSubtleProps = {
  className?: string;
  subtitle?: string;
  title: string;
};

const SectionHeadingSubtle = ({
  title,
  subtitle,
  className,
}: SectionHeadingSubtleProps) => {
  let cleanedClassName = className?.replace("mb-3", "") || "";
  cleanedClassName += " py-3";

  return (
    <div className={cleanedClassName}>
      <Text
        className="mb-1"
        weight={TextWeight.Medium500}
        size={TextSize.SM}
        color={TextColor.Gray400}
      >
        {title.toUpperCase()}
      </Text>

      {subtitle && (
        <Text
          weight={TextWeight.Regular400}
          size={TextSize.SM}
          color={TextColor.Gray400}
        >
          {subtitle}
        </Text>
      )}
    </div>
  );
};

export default SectionHeadingSubtle;
