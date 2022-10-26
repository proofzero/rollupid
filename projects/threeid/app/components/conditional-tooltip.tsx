import { Tooltip } from "flowbite-react";

type ConditionalTooltipProps = {
  children: any;
  condition: boolean;
  content: string;
  trigger?: "hover" | "click";
};

const ConditionalTooltip = ({
  condition,
  content,
  children,
  trigger = "hover",
}: ConditionalTooltipProps) => {
  return condition ? (
    <Tooltip content={content} trigger={trigger}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};

export default ConditionalTooltip;
