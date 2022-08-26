import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  UIManager,
  TouchableOpacity,
} from "react-native";

const AccordionWhatIsPFP = ({ defaultExpanded} : { defaultExpanded: boolean }) => {
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
                What is my the 3ID PFP?
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
                  marginTop: "1em",
                  fontSize: 14,
                  color: "#9CA3AF",
                  fontFamily: "Inter_400Regular",
                }}
              >
                <Text>
                  Your 3ID gradient PFP is a soulbound avatar made up of 4 color
                  traits -- one version color and three common, uncommon, rare
                  and epic colors traits. Rarity is decided by several factors.
                </Text>

                <ol>
                  <li>
                    The first color trait probability is based on which popular
                    NFTs you currently hold.
                  </li>

                  <li>
                    The second color trait is based on which of our developer
                    collections you hold.
                  </li>

                  <li>The last color trait is based on your ETH balance.</li>
                </ol>

                <Text>
                  Click{" "}
                  <a
                    target={"_blank"}
                    rel={"noopener noopener noreferrer"}
                    href={`https://github.com/kubelt/kubelt/tree/main/nftar`}
                  >
                    here
                  </a>{" "}
                  to read the code. Once generated, your 3ID gradient PFP is
                  soul bound to your identity. More generations of this PFP will
                  be released corresponding with every major version of 3ID.
                </Text>
              </Text>
            </>
          )}
        </View>
      </View>
    </>
  );
};

export default AccordionWhatIsPFP;
