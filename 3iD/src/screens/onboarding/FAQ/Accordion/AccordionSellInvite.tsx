import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  UIManager,
  TouchableOpacity,
} from "react-native";

const AccordionSellInvite = ({
  defaultExpanded,
}: {
  defaultExpanded: boolean;
}) => {
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
                Can I sell my invite card?
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
                color: "#4B5563",
                fontFamily: "Inter_400Regular",
              }}
            >
              Yes. You can list your invite card on{" "}
              <a
                target={"_blank"}
                rel={"noopener noopener noreferrer"}
                href={`https://opensea.io/collection/3id-invite`}
              >
                OpenSea
              </a>{" "}
              or transfer it to a friend.
            </Text>
          )}
        </View>
      </View>
    </>
  );
};

export default AccordionSellInvite;
