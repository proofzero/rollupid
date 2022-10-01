import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export type SectionTitleProps = {
  className?: string;
  subtitle?: string;
  title: string;
};

const SectionTitle = ({ className, title, subtitle }: SectionTitleProps) => {
  let cleanedClassName = className?.replace("mb-3", "") || "";
  cleanedClassName += " mb-3";

  return (
    <div className={cleanedClassName}>
      <Text
        className="mb-1"
        weight={TextWeight.SemiBold600}
        size={TextSize.XL}
        color={TextColor.Gray800}
      >
        {title}
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

export default SectionTitle;
