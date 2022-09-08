import { NavLink  } from "@remix-run/react";

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
  const activeStyle = {
  };
  return (
    <div
      className={
        `${item.current ? "bg-gray-100" : "lg:bg-transparent hover:bg-gray-100"} basis-1/4 lg:w-100`
      }
    >
        <NavLink 
          to={item.href}
          aria-current={item.current ? "page" : undefined}
          className="group lg:border-l-4 px-3 py-2 flex justify-center items-center flex-row lg:justify-start lg:items-start"
          // if href is "" or "#" isActive is true so we can't use this yet
          // style={({ isActive }) =>
          //     isActive ? activeStyle : undefined
          // }
        >      

          <item.icon
            className="flex-shrink-0 -ml-1 lg:mr-3 h-6 w-6"
            style={{
              color: item.current ? "#4B5563" : "#9CA3AF",
            }}
            aria-hidden="true"
          />
          
          <ConditionalTooltip content="Coming Soon" condition={!item.exists}>

            <span className="hidden lg:block">
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
            </span>
          
          </ConditionalTooltip>

        </NavLink >
    </div>
  );
};

export default SideNavItem;
