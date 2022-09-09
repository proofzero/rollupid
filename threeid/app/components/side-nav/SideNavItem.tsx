import ConditionalTooltip from "../conditional-tooltip";

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
        item.current
          ? "bg-gray-100 text-gray-600"
          : "bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }
    >
      <a
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        className="group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
      >
        <item.icon
          className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 side-nav-item-font"
          aria-hidden="true"
        />
        <ConditionalTooltip content="Coming Soon" condition={!item.exists}>
          <span className="truncate side-nav-item-font">{item.name}</span>
        </ConditionalTooltip>
      </a>
    </div>
  );
};

export default SideNavItem;
