import { Text } from '@kubelt/design-system'

export type SectionHeadingProps = {
  className?: string;
  children: string;
};

const SectionHeading = ({ children, className }: SectionHeadingProps) => {
  return (
    <Text
      className={`${className} text-gray-600`}
      weight="medium"
      size="base"
    >
      {children}
    </Text>
  );
};

export default SectionHeading;
