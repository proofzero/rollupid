import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { Text, useWindowDimensions } from "react-native";

import styled from "styled-components";

const LinkWrapper = styled.div`
  &:hover span {
    visibility: visible;
  }
`;

const Tooltip = styled.span`

  visibility: hidden;
  width: 140px;
  background-color: #9CA3AF;
  color: #fff;
  z-index: 1;
  bottom: 100%;
  margin-left: -90px;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 7px;
    border-style: solid;
    border-color: #9CA3AF transparent transparent transparent;
      }
  }
`;

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
    <LinkWrapper>
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
        <Tooltip>Coming Soon</Tooltip>
      </Text>
    </div>
    </LinkWrapper>
  );
};

export default NavMenuItem;
