import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { Text, useWindowDimensions } from "react-native";

type NavMenuItemProps = {
  screen: string;
  title: string;
};

const NavMenuItem = ({ screen, title }: NavMenuItemProps) => {
  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  const isCurrent = navRoutes[navIndex].name === screen;

  const window = useWindowDimensions();

  return (
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
          fontFamily: "Manrope_500Medium",
          fontSize: 18,
          lineHeight: 20,
          color: "white",
        }}
      >
        {title}
      </Text>
    </Link>
  );
};

export default NavMenuItem;
