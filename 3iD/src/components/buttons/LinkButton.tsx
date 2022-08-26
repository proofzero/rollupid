import Constants from "expo-constants";
import React from "react";
import { IconType } from "react-icons/lib";
import { Pressable, Image, Text, View } from "react-native";

type LinkButtonProps = {
  url: string;
  title: string;
  Icon?: IconType;
  iconColor?: string;
};

const LinkButton = ({ url, title, Icon, iconColor }: LinkButtonProps) => {
  return (
    <a
      target={"_blank"}
      rel={"noopener noopener noreferrer"}
      href={url}
      style={{
        textDecoration: "none",
        padding: "12px 45px",
        backgroundColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {Icon && (
          <Icon
            style={{
              width: 19.82,
              height: 15.11,
              marginRight: 13.09,
              color: iconColor ?? "#374151",
            }}
          />
        )}

        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            fontWeight: "500",
            lineHeight: 16,
            color: "#374151",
          }}
        >
          {title}
        </Text>
      </View>
    </a>
  );
};

export default LinkButton;
