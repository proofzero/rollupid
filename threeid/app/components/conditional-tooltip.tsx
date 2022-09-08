import { Tooltip } from "flowbite-react";

type ConditionalTooltipProps = {
  children: any;
  condition: boolean;
  content: string;
};

const ConditionalTooltip = ({
  condition,
  content,
  children,
}: ConditionalTooltipProps) => {
  return condition ? (
    <Tooltip content={content} trigger="hover">
      {children}
    </Tooltip>
  ) : (
    children
  );
};

export default ConditionalTooltip;
