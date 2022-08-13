import React, { useCallback, useEffect, useState } from "react";

import {
  Text,
  TextInput,
  View,
  Button,
  Image,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import Layout from "../Layout";

import useAccount from "../../hooks/account";
import {
  authenticate,
  isAuthenticated,
  purge,
  threeIdGetEns,
  tickFunnelStep,
} from "../../provider/kubelt";
import { connect, forceAccounts } from "../../provider/web3";

const PanelHead = () => (
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
      Set Profile URL
    </Text>

    <Text
      style={{
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 29,
      }}
    >
      We currently only support wallet ID or ENS domain as profile URL
    </Text>
  </>
);

const Select = ({ account, ens }: { account: string; ens: string[] }) => {
  const [selected, setSelected] = useState(account);

  useEffect(() => {
    if (ens.length > 0) {
      setSelected(ens[0]);
    }
  }, []);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PanelHead />

      <View>
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${
              selected === account ? "#EEF2FF" : "transparent"
            }`,
            padding: 17,
            marginBottom: 19,
          }}
          onPress={() => setSelected(account)}
        >
          <Image
            style={{
              width: 16,
              height: 16,
              marginRight: 12,
            }}
            source={require(`../../assets/combo_${
              selected === account ? "true" : "false"
            }.png`)}
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              testID="naming-use-wallet-id"
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                fontWeight: "500",
                lineHeight: 20,
                color: "#374151",
              }}
            >
              Use wallet ID as profile URL
            </Text>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 20,
                color: `#${selected === account ? "4338CA" : "6B7280"}`,
              }}
            >
              {account}
            </Text>
          </View>
        </Pressable>

        <View>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              fontWeight: "400",
              lineHeight: 12,
              color: "#9CA3AF",
            }}
          >
            ENS Domains
          </Text>

          {ens.length === 0 ? (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                fontWeight: "400",
                lineHeight: 24,
                color: "#9CA3AF",
                textAlign: "center",
                marginTop: 18,
              }}
            >
              No ENS domains were detected
            </Text>
          ) : (
            <ScrollView
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                maxHeight: 165,
              }}
            >
              <FlatList
                data={ens}
                renderItem={({ item }) => (
                  <Pressable
                    key={item}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: `${
                        selected === item ? "#EEF2FF" : "transparent"
                      }`,
                      padding: 17,
                    }}
                    onPress={() => setSelected(item)}
                  >
                    <Image
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 12,
                      }}
                      source={require(`../../assets/combo_${
                        selected === item ? "true" : "false"
                      }.png`)}
                    />

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        testID="naming-select-ens"
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          fontWeight: "500",
                          lineHeight: 20,
                          color: "#374151",
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const Detecting = ({}: {}) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <PanelHead />

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
        Scanning for ENS domains
      </Text>
    </View>
  </View>
);

export default function Naming({ navigation }: any) {
  const [screen, setScreen] = useState<"root" | "select">("root");

  const [ens, setEns] = useState<string[]>([]);

  const account = useAccount();

  const fetchEns = async () => {
    const ensRes = await threeIdGetEns();

    if (ensRes) {
      setEns(ensRes);
    } else {
      setEns([]);
    }

    setScreen("select");
  };

  const goToSettings = async () => {
    await tickFunnelStep("naming");
    navigation.navigate("Onboard");
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      return navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      if (await isAuthenticated(account)) {
        await fetchEns();
      } else {
        const provider = await connect();

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await fetchEns();
        } else {
          purge();

          return navigation.navigate("Landing");
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
                width: 10,
                height: 10,
                marginRight: 15,
              }}
              source={require("../../assets/bullet.png")}
            />

            <Image
              style={{
                width: 20,
                height: 20,
              }}
              source={require("../../assets/bullet_on.png")}
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
            {screen === "root" && <Detecting />}

            {screen === "select" && account && (
              <Select ens={ens} account={account} />
            )}
          </View>

          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
              minHeight: 42, // just to reduce flickering
            }}
          >
            {screen === "select" && (
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
                onPress={goToSettings}
              >
                <Text
                  testID="naming-finish"
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    fontWeight: "500",
                    lineHeight: 24,
                    color: "white",
                  }}
                >
                  Finish
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Layout>
  );
}
