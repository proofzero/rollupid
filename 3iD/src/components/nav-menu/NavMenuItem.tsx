import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { Text } from "react-native";

type NavMenuItemProps = {
  screen: string;
  title: string;
};

const NavMenuItem = ({ screen, title }: NavMenuItemProps) => {
  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  const isCurrent = navRoutes[navIndex].name === screen;
  const isActive = screen != null;

  return (
    <Link
      style={{
        marginLeft: 25,
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
