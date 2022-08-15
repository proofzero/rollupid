import React, { useEffect, useState } from "react";

import { Text, View, Image, Pressable } from "react-native";
import Layout from "../Layout";

import { Feather } from "@expo/vector-icons";
import useAccount from "../../hooks/account";
import {
  authenticate,
  GenPfPRes,
  isAuthenticated,
  purge,
  threeIdGenPfP,
  threeIdMint,
  tickFunnelStep,
} from "../../provider/kubelt";
import { connect, forceAccounts, sign } from "../../provider/web3";

const PanelHead = ({ genPfPRes }: { genPfPRes: GenPfPRes }) => (
  <>
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
          uri: genPfPRes?.metadata?.image,
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
            uri: genPfPRes?.metadata?.image,
          }}
        />
      </div>
    </View>
  </>
);

const PreMint = ({
  genPfPRes,
  mintRequestHandler,
}: {
  genPfPRes: GenPfPRes;
  mintRequestHandler: (genPfPRes: GenPfPRes) => void;
}) => {
  const [trait, setTrait] = useState<any>();

  useEffect(() => {
    if (genPfPRes?.metadata?.properties?.traits) {
      const traits = Object.keys(genPfPRes?.metadata?.properties?.traits);
      if (traits.length > 0) {
        setTrait(genPfPRes.metadata.properties.traits[traits[0]]);
      }
    }
  }, [genPfPRes]);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PanelHead genPfPRes={genPfPRes} />

      <View
        style={{
          flexDirection: "row",
          marginBottom: 37,
        }}
      >
        <Image
          style={{
            width: 24,
            height: 24,
            marginRight: 8,
          }}
          source={require("../../assets/info.png")}
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
          <b style={{ cursor: "default" }} title={genPfPRes?.voucher?.account}>
            blockchain account
          </b>
          ,{" "}
          <b style={{ cursor: "default" }} title={trait?.value?.name}>
            version name
          </b>{" "}
          and{" "}
          <b style={{ cursor: "default" }} title={trait?.type}>
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
        onPress={() => mintRequestHandler(genPfPRes)}
      >
        <Text
          testID="mint-mint-nft"
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
};

const Confirm = ({
  genPfPRes,
  tryAgainHandler,
}: {
  genPfPRes: GenPfPRes;
  tryAgainHandler: () => void;
}) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <PanelHead genPfPRes={genPfPRes} />

    <Text
      style={{
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        color: "#9CA3AF",
        marginBottom: 37,
      }}
    >
      Please confirm the transaction in your wallet or
    </Text>

    <Pressable
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 38,
        paddingVertical: 9,
        backgroundColor: "transparent",
      }}
      onPress={tryAgainHandler}
    >
      <Text
        testID="mint-confirm-try-again"
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          fontWeight: "500",
          lineHeight: 24,
          color: "#1F2937",
        }}
      >
        Try again
      </Text>
    </Pressable>
  </View>
);

const Progress = ({ genPfPRes }: { genPfPRes: GenPfPRes }) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <PanelHead genPfPRes={genPfPRes} />

    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 37,
      }}
    >
      <Image
        style={{
          width: 24,
          height: 24,
          marginRight: 8,
        }}
        source={require("../../assets/loading.png")}
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
        Minting, please wait
      </Text>
    </View>
  </View>
);

const Success = ({ genPfPRes }: { genPfPRes: GenPfPRes }) => {
  useEffect(() => {
    const asyncFn = async () => {
      await tickFunnelStep("mint");
    };

    asyncFn();
  }, []);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PanelHead genPfPRes={genPfPRes} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 37,
        }}
      >
        <Image
          style={{
            width: 24,
            height: 24,
            marginRight: 8,
          }}
          source={require("../../assets/success.png")}
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
          Minted successfully!
        </Text>
      </View>
    </View>
  );
};

const ErrorPanel = ({
  genPfPRes,
  tryAgainHandler,
}: {
  genPfPRes: GenPfPRes;
  tryAgainHandler: () => void;
}) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <PanelHead genPfPRes={genPfPRes} />

    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 37,
      }}
    >
      <Image
        style={{
          width: 24,
          height: 24,
          marginRight: 8,
        }}
        source={require("../../assets/error.png")}
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
        Something went wrong
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
        backgroundColor: "transparent",
      }}
      onPress={tryAgainHandler}
    >
      <Text
        testID="mint-try-again"
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          fontWeight: "500",
          lineHeight: 24,
          color: "#1F2937",
        }}
      >
        Try again
      </Text>
    </Pressable>
  </View>
);

export default function Mint({ navigation }: any) {
  const [screen, setScreen] = useState<
    "root" | "confirm" | "progress" | "success" | "error"
  >("root");

  const account = useAccount();

  const [genPfPRes, setGenPfPRes] = React.useState<GenPfPRes>();

  const skipMinting = async () => {
    await tickFunnelStep("mint");

    navigation.navigate("Settings");
  };

  const genPfP = async () => {
    const provider = await connect();

    const pfpRes = await threeIdGenPfP(provider);

    setGenPfPRes(pfpRes);
  };

  const handleMintRequest = async (genPfPRes: GenPfPRes) => {
    setScreen("confirm");

    // Request signature
    try {
      const voucher = genPfPRes?.voucher;
      const signedVoucher = await sign(JSON.stringify(voucher, null, 2));

      setScreen("progress");

      const mintRes = await threeIdMint(signedVoucher);
      if (!mintRes) {
        throw new Error();
      }

      setScreen("success");
    } catch (e) {
      console.error("Failed to complete minting journey");

      setScreen("error");
    }
  };

  const handleTryAgain = async () => {
    setScreen("root");
  };

  const continueToOnboarding = async () => {
    navigation.navigate("Onboard");
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      if (await isAuthenticated(account)) {
        await genPfP();
      } else {
        const provider = await connect();

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await genPfP();
        } else {
          purge();

          navigation.navigate("Landing");
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
            minHeight: 580,
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
            {screen === "root" && (
              <PreMint
                mintRequestHandler={handleMintRequest}
                genPfPRes={genPfPRes}
              />
            )}
            {screen === "confirm" && (
              <Confirm tryAgainHandler={handleTryAgain} genPfPRes={genPfPRes} />
            )}
            {screen === "progress" && <Progress genPfPRes={genPfPRes} />}
            {screen === "success" && <Success genPfPRes={genPfPRes} />}
            {screen === "error" && (
              <ErrorPanel
                tryAgainHandler={handleTryAgain}
                genPfPRes={genPfPRes}
              />
            )}
          </View>

          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
              minHeight: 42, // just to reduce flickering
            }}
          >
            {(screen === "root" ||
              screen === "confirm" ||
              screen === "error") && (
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
                  testID="mint-skip-minting"
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
            )}

            {screen === "success" && (
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
                onPress={continueToOnboarding}
              >
                <Text
                  testID="mint-continue"
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    fontWeight: "500",
                    lineHeight: 24,
                    color: "white",
                  }}
                >
                  Continue
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Layout>
  );
}
