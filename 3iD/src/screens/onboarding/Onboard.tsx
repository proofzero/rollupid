import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";

import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import LinkButton from "../../components/buttons/LinkButton";
import useAccount from "../../hooks/account";
import { getSDK } from "../../provider/kubelt";
import { getFunnelState, getInviteCode } from "../../services/threeid";

import FAQ from "./FAQ";

import Layout from "../AuthLayout";

type OnboardProps = {
  navigation: any;
};

const Onboard = ({ navigation }: OnboardProps) => {
  const account = useAccount();
  const window = useWindowDimensions();

  const [inviteCode, setInviteCode] = useState<string | undefined>();

  const [canMint, setCanMint] = useState(false);

  const [steps] = useState<
    {
      title: string;
      complete: boolean;
    }[]
  >([
    {
      title: "Claim your 3ID",
      complete: true,
    },
    {
      title: "Claim your PFP",
      complete: false,
    },
    {
      title: "Add user details",
      complete: false,
    },
    {
      title: "Create NFT gallery",
      complete: false,
    },
    {
      title: "Link More Wallets",
      complete: false,
    },
    {
      title: "Secure KYC",
      complete: false,
    },
  ]);

  const percentage =
    (steps.filter((s) => s.complete).length / steps.length) * 100;

  useEffect(() => {
    const asyncFn = async () => {
      const sdk = await getSDK();

      const funnelState = await getFunnelState(sdk);
      if (!funnelState.mint) {
        setCanMint(true);
      }

      const inviteCodeRes = await getInviteCode(sdk);
      if (inviteCodeRes) {
        setInviteCode(inviteCodeRes);
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

  return (
    <Layout navigation={navigation}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        {/* Mint */}
        {canMint && (
          <View
            style={{
              padding: 20,
              flexDirection: "row",

              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F9FAFB",

              marginBottom: 13,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Image
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 12,
                }}
                source={require("../../assets/mint.png")}
              />

              <View>
                <Text
                  style={{
                    paddingBottom: 4,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 20,
                    color: "#111827",
                  }}
                >
                  Free mint!
                </Text>

                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    fontWeight: "400",
                    lineHeight: 20,
                    color: "#6B7280",
                  }}
                >
                  You can still mint your 1/1 gradient for free
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Pressable
                disabled={true}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 22.5,
                  paddingVertical: 9,
                  marginRight: 12,
                  backgroundColor: "#F3F4F6",
                }}
              >
                <Text
                  testID="onboard-dont-show-again"
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#374151",
                  }}
                >
                  Don't show again
                </Text>
              </Pressable>

              <Pressable
                disabled={true}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 22.5,
                  paddingVertical: 9,
                  backgroundColor: "#1F2937",
                }}
              >
                <Text
                  testID="onboard-mint"
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "white",
                  }}
                >
                  Mint
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Hero */}
        <View
          style={{
            padding: 30,
            backgroundColor: "#F9FAFB",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 36,
              fontWeight: "500",
              lineHeight: 40,
              color: "#1F2937",
              marginBottom: 15,
            }}
          >
            Welcome to 3ID! 🎉
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              fontWeight: "400",
              lineHeight: 24,
              color: "#6B7280",
              marginBottom: 22,
            }}
          >
            The app is currently in beta. We will be unlocking new features on
            weekly basis. <br />
            Please follow us on Twitter and join our Discord to stay updated!{" "}
          </Text>

          <View
            style={{
              flexDirection: window.width >= window.height ? "row" : "column",
              alignItems: "center",
            }}
          >
            <LinkButton
              url={Constants.manifest?.extra?.twitterUrl}
              title="Twitter"
              Icon={FaTwitter}
              iconColor="#1D9BF0"
            />
            <View style={{ width: 10, height: 10 }} />
            <LinkButton
              url={Constants.manifest?.extra?.discordUrl}
              title="Discord"
              Icon={FaDiscord}
              iconColor="#5865F2"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: window.width >= window.height ? "row" : "column",
          }}
        >
          {/* Steps */}
          <View
            style={
              window.width >= window.height
                ? {
                    flex: 1,
                  }
                : {
                    marginBottom: "1em",
                  }
            }
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                fontWeight: "600",
                lineHeight: 32,
                color: "#1F2937",
              }}
            >
              Roadmap
            </Text>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 23,
              }}
            >
              You will earn 1 Invite NFT for each step completed
            </Text>

            {/* Progress bar */}
            <View
              style={{
                width: "100%",
                backgroundColor: "#F3F4F6",
                height: 4.65,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: `${percentage}%`,
                  backgroundColor: "#4F46E5",
                  flex: 1,
                }}
              ></View>
            </View>

            {/* Steps */}
            <View
              style={{
                borderWidth: 1,
                borderColor: "#F3F4F6",
                padding: 17,
              }}
            >
              {steps.map((step, index) => (
                <View
                  key={step.title}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: index !== steps.length - 1 ? 32 : 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        width: 25.6,
                        height: 25.6,
                        marginRight: 19.2,
                      }}
                      source={require(`../../assets/step_${
                        step.complete ? "complete" : "soon"
                      }.png`)}
                    />

                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          fontWeight: "500",
                          lineHeight: 20,
                          color: "#111827",
                        }}
                      >
                        {step.title}
                      </Text>

                      {step.complete && (
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 14,
                            fontWeight: "400",
                            lineHeight: 20,
                            color: "#6B7280",
                          }}
                        >
                          Completed
                        </Text>
                      )}

                      {!step.complete && (
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 14,
                            fontWeight: "400",
                            lineHeight: 20,
                            color: "#D1D5DB",
                          }}
                        >
                          Coming Soon
                        </Text>
                      )}
                    </View>
                  </View>

                  {!step.complete && (
                    <Pressable
                      disabled={true}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          fontWeight: "500",
                          lineHeight: 16,
                          color: "#E5E7EB",
                        }}
                      >
                        View
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <FAQ account={account} inviteCode={inviteCode} />
        </View>
      </View>
    </Layout>
  );
};

export default Onboard;
