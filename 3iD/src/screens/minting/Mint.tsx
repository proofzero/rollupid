import React, { useEffect } from "react";

import { Text, TextInput, View, Button, Image, Pressable } from "react-native";
import Layout from "../Layout";

import { Ionicons, Feather } from "@expo/vector-icons";
import useAccount from "../../hooks/account";
import {
  authenticate,
  isAuthenticated,
  PreMintRes,
  threeIdGetPreMint,
} from "../../provider/kubelt";
import { connect, forceAccounts } from "../../provider/web3";

const PreMint = ({ preMint }: { preMint: PreMintRes }) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        fontFamily: "Inter_500Medium",
        fontSize: 36,
        fontWeight: "500",
        lineHeight: 40,
        color: "#1F2937",
        marginBottom: 13,
      }}
    >
      Congratulations!
    </Text>

    <Text
      style={{
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 66,
      }}
    >
      We just mathematically generated this 1/1 gradient PFP &amp; cover photo
      for you. <br /> You can mint this as NFT for FREE - you only pay the gas
      fee.
    </Text>

    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
      }}
    >
      <Image
        style={{
          width: 93,
          height: 93,
        }}
        source={{
          uri: preMint?.nftImageUrl,
        }}
      />

      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <Feather name="arrow-right" size={24} color="#9CA3AF" />
      </View>

      <div
        style={{
          width: 93,
          height: 93,
          clipPath:
            "polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)",
          boxShadow: "inset 0px 10px 100px 10px white",
          transform: "scale(1.2)",
        }}
      >
        <Image
          style={{
            width: 93,
            height: 93,
          }}
          source={{
            uri: preMint?.nftImageUrl,
          }}
        />
      </div>
    </View>

    <View
      style={{
        flexDirection: "row",
        marginBottom: 37,
      }}
    >
      <Ionicons
        style={{
          marginRight: 10,
        }}
        name="information-circle-outline"
        size={24}
        color="#9CA3AF"
      />

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          fontWeight: "400",
          lineHeight: 24,
          color: "#9CA3AF",
        }}
      >
        The image was generated using your{" "}
        <b style={{ cursor: "default" }} title={preMint?.account}>
          blockchain account
        </b>
        ,{" "}
        <b style={{ cursor: "default" }} title={preMint?.version}>
          version name
        </b>{" "}
        and{" "}
        <b style={{ cursor: "default" }} title={preMint?.rarity}>
          trait rarity
        </b>
        .
      </Text>
    </View>

    <Pressable
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 38,
        paddingVertical: 9,
        backgroundColor: "#1F2937",
      }}
    >
      <Text
        testID="mint-nft"
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          fontWeight: "500",
          lineHeight: 24,
          color: "white",
        }}
      >
        Mint NFT
      </Text>
    </Pressable>
  </View>
);

const Confirm = () => (
  <View>
    <Text>Confirm</Text>
  </View>
);

const Success = () => (
  <View>
    <Text>Success</Text>
  </View>
);

const Error = () => (
  <View>
    <Text>Error</Text>
  </View>
);

export default function Mint({ navigation }: any) {
  const account = useAccount();

  const [preMint, setPreMint] = React.useState<PreMintRes>();

  const skipMinting = () => {
    // TODO: Tell Oort that I'm skipping
    // or perhaps let Oort know when I got to
    // this screen that I already went through
    // skip; business decision.

    return navigation.navigate("Settings");
  };

  const fetchPreMint = async () => {
    const preMintRes = await threeIdGetPreMint();
    setPreMint(preMintRes);
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      return navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      if (await isAuthenticated(account)) {
        await fetchPreMint();
      } else {
        const provider = await connect();

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await fetchPreMint();
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

  useEffect(() => {
    const asyncFn = async () => {
      await forceAccounts();
    };

    if (account === undefined) {
      asyncFn();
    }
  }, []);

  let panel = null;
  if (preMint) {
    panel = <PreMint preMint={preMint} />;
  }

  return (
    <Layout>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 895,
            maxWidth: "75vw",
            shadowRadius: 5,
            shadowOpacity: 0.1,
            backgroundColor: "white",
            paddingTop: 29,
            paddingBottom: 26,
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              marginBottom: 47,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{
                width: 20,
                height: 20,
                marginRight: 15,
              }}
              source={require("../../assets/bullet_on.png")}
            />

            <Image
              style={{
                width: 10,
                height: 10,
              }}
              source={require("../../assets/bullet_off.png")}
            />
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            {panel}
          </View>

          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 38,
                paddingVertical: 9,
                backgroundColor: "#E5E7EB",
              }}
              onPress={() => skipMinting()}
            >
              <Text
                testID="try-different-wallet"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  fontWeight: "500",
                  lineHeight: 24,
                  color: "#6B7280",
                }}
              >
                Skip
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Layout>
  );
}
