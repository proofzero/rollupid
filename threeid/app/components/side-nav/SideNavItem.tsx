import ConditionalTooltip from "../conditional-tooltip";
import Text, { TextColor, TextSize, TextWeight } from "../typography/Text";

type SideNavItemProps = {
  item: {
    name: string;
    href: string;
    icon: any;
    current: boolean;
    exists?: boolean;
  };
};
const SideNavItem = ({ item }: SideNavItemProps) => {
  return (
    <div
      className={
        item.current ? "bg-gray-100" : "bg-transparent hover:bg-gray-100"
      }
    >
      <a
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        className="group border-l-4 px-3 py-2 flex items-center"
      >
        <item.icon
          className="flex-shrink-0 -ml-1 mr-3 h-6 w-6"
          style={{
            color: item.current ? "#4B5563" : "#9CA3AF",
          }}
          aria-hidden="true"
        />

        <ConditionalTooltip content="Coming Soon" condition={!item.exists}>
          {item.current && (
            <Text
              className="truncate"
              size={TextSize.Base}
              weight={TextWeight.Medium500}
              color={TextColor.Gray600}
            >
              {item.name}
            </Text>
          )}
          {!item.current && (
            <Text
              className="truncate"
              size={TextSize.Base}
              weight={TextWeight.Medium500}
              color={TextColor.Gray400}
            >
              {item.name}
            </Text>
          )}
        </ConditionalTooltip>
      </a>
    </div>
  );
};

export default SideNavItem;
