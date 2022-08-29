import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  UIManager,
  TouchableOpacity,
} from "react-native";

type HowToProps = {
  account: undefined | null | string;
  defaultExpanded: boolean;
};

const AccordionHowToUse = ({ account, defaultExpanded }: HowToProps) => {
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
          // borderBottomWidth: 1,
          // borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={handleToggle} activeOpacity={1}>
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
                How do I use 3ID?
              </Text>

              <Image
                style={styles}
                source={require("../../../../assets/dropdown.png")}
              ></Image>
            </View>
          </TouchableOpacity>
          {expanded && (
            <>
              <Text
                style={{
                  marginVertical: "1em",
                  fontSize: 14,
                  color: "#4B5563",
                  fontFamily: "Inter_400Regular",
                }}
              >
                Now that you've claimed your 3ID, other applications can query
                your profile to fetch your public profile details including your
                avatar. Soon you will also be able to promote your profile and
                NFTs on social media.
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#4B5563",
                  fontFamily: "Inter_400Regular",
                }}
              >
                In our roadmap we have many more features coming including
                linking multiple accounts together, messaging, storage and more.
              </Text>
            </>
          )}
        </View>
      </View>
    </>
  );
};

export default AccordionHowToUse;
