import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { Text, useWindowDimensions } from "react-native";

type NavMenuItemProps = {
  screen?: string;
  title: string;
};

const NavMenuItem = ({ screen, title }: NavMenuItemProps) => {
  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  const isCurrent = navRoutes[navIndex].name === screen;

  const window = useWindowDimensions();

  return screen ? (
    <Link
      style={{
        marginLeft: window.width >= window.height ? 25 : 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: isCurrent ? "#373F52" : "transparent",
      }}
      to={{
        screen: `${screen}`,
        params: [],
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          lineHeight: 20,
          color: "#374151",
        }}
      >
        {title}
      </Text>
    </Link>
  ) : (
    <div
      style={{
        marginLeft: window.width >= window.height ? 25 : 0,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: "transparent",
        cursor: "default",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          lineHeight: 20,
          color: "#374151",
        }}
      >
        {title}
      </Text>
    </div>
  );
};

export default NavMenuItem;
