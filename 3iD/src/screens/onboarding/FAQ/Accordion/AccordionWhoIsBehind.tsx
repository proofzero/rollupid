import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  UIManager,
  TouchableOpacity,
} from "react-native";

const AccordionWhoIsBehind = ({ defaultExpanded } : { defaultExpanded: boolean }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [styles, setStyles] = useState({
    width: 14,
    height: 7,
    transform: [{ rotate: "0deg" }],
  });

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const handleToggle = () => {
    const state = expanded;
    setExpanded(!expanded);
    setStyles(
      state
        ? { width: 14, height: 7, transform: [{ rotate: "0deg" }] }
        : { width: 14, height: 7, transform: [{ rotate: "180deg" }] }
    );
  };

  return (
    <>
      <View
        style={{
          paddingVertical: 16,
          borderBottomWidth: 0,
          // borderBottomColor: "#E5E7EB",
          fontFamily: "Inter_400Regular",
        }}
      >
        <View
          style={{
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={handleToggle}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E5E7EB",
                paddingBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  fontWeight: "500",
                  lineHeight: 16,
                  color: "#4B5563",
                }}
              >
                Who is behind this project?
              </Text>

              <Image
                style={styles}
                source={require("../../../../assets/dropdown.png")}
              ></Image>
            </View>
          </TouchableOpacity>
          {expanded && (
            <Text
              style={{
                marginTop: "1em",
                fontSize: 14,
                color: "#9CA3AF",
                fontFamily: "Inter_400Regular",
              }}
            >
              3ID is created by{" "}
              <a
                target={"_blank"}
                rel={"noopener noopener noreferrer"}
                href={`https://kubelt.com`}
              >
                Kubelt
              </a>
              , a decentralized application platform, and is inspired by Web3
              and the digital identity specification. Instead of applications
              centralizing user data, 3ID users like yourself will be able to
              permission/revoke applications to access personal data, messages
              and more.<br/><br/>Our goal is to eliminate email as a basis of online
              identity and shift the norm towards being cryptographic,
              user-centric and decentralized platforms.
            </Text>
          )}
        </View>
      </View>
    </>
  );
};

export default AccordionWhoIsBehind;
