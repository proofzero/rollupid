import { Link, useNavigationState } from "@react-navigation/native";
import React from "react";
import { IconType } from "react-icons/lib";
import { View, Image, Text } from "react-native";
import styled from "styled-components"

const LinkWrapper = styled.div`
  &:hover {
    background-color: #F3F4F6;
  }

  &:focus {
    box-shadow: 0px 0px 0px 1px #9CA3AF;
  }

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
  left: 60%;
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
    <LinkWrapper>
      <div
        style={{
          fontFamily: "Inter_400Regular",
          paddingTop: 14,
          paddingBottom: 14,
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
                  fontSize: 14,
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
                fontSize: 14,
                lineHeight: 20,
                color: isCurrent ? "#111827" : "gray",
              }}
            >
              {title}
            </Text>
            <Tooltip>Coming Soon</Tooltip>
          </View>
        )}
      </div>
    </LinkWrapper>
  );
};

export default SideMenuItem;
