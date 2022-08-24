import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { IconType } from "react-icons/lib";
import { View, Image, Text } from "react-native";

export type SideMenuItemProps = {
  title: string;
  /**
   * Leaving screen null will only placehold the menu item
   */
  screen?: string;
  Icon: IconType;
};

const SideMenuItem = ({ title, screen, Icon }: SideMenuItemProps) => {
  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  const isCurrent = navRoutes[navIndex].name === screen;
  const isActive = screen != null;

  return (
    <div
      style={{
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 8,
        paddingRight: 9,
        backgroundColor: isCurrent ? "#F3F4F6" : "transparent",
        cursor: isActive ? "pointer" : "default",
      }}
      title={isActive ? title : "Coming soon"}
    >
      {isActive && (
        <Link
          to={{
            screen: `${screen}`,
            params: [],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              style={{
                width: 20,
                height: 20,
                marginRight: 15,
                color: isCurrent ? "#111827" : "gray",
              }}
            ></Icon>

            <Text
              style={{
                fontFamily: "Manrope_500Medium",
                fontSize: 18,
                lineHeight: 20,
                color: isCurrent ? "#111827" : "gray",
              }}
            >
              {title}
            </Text>
          </View>
        </Link>
      )}

      {!isActive && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon
            style={{
              width: 20,
              height: 20,
              marginRight: 15,
              color: isCurrent ? "#111827" : "gray",
            }}
          ></Icon>

          <Text
            style={{
              fontFamily: "Manrope_500Medium",
              fontSize: 18,
              lineHeight: 20,
              color: isCurrent ? "#111827" : "gray",
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </div>
  );
};

export default SideMenuItem;
