import Constants from "expo-constants";
import React, { useEffect, useMemo, useState } from "react";

import { View, Text, Image, Pressable, Touchable } from "react-native";
import { getFunnelState } from "../../provider/kubelt";

import Layout from "../AuthLayout";

export default function Onboard({ navigation }: { navigation: any }) {
  const [canMint, setCanMint] = useState(false);

  const [steps] = useState<
    {
      title: string;
      complete: boolean;
    }[]
  >([
    {
      title: "Claim your 3iD",
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
      const funnelState = await getFunnelState();
      if (!funnelState.mint) {
        setCanMint(true);
      }
    };

    asyncFn();
  }, []);

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
                source={{
                  uri: "https://picsum.photos/40",
                }}
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
              flexDirection: "row",
            }}
          >
            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 44.5,
                paddingVertical: 12,
                marginRight: 10,
                backgroundColor: "#F3F4F6",
              }}
            >
              <Image
                style={{
                  width: 19,
                  height: 16,
                  marginRight: 13.5,
                }}
                source={require("../../assets/twitter.png")}
              />

              <Text
                testID="onboard-twitter"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                }}
              >
                <a
                  target={"_blank"}
                  rel={"noopener noopener noreferrer"}
                  href={Constants.manifest?.extra?.twitterUrl}
                  style={{ color: "#374151", textDecoration: "none" }}
                >
                  Twitter
                </a>
              </Text>
            </Pressable>

            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 44.5,
                paddingVertical: 12,
                backgroundColor: "#F3F4F6",
              }}
            >
              <Image
                style={{
                  width: 19.82,
                  height: 15.11,
                  marginRight: 13.09,
                }}
                source={require("../../assets/discord.png")}
              />

              <Text
                testID="onboard-twitter"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                  color: "#374151",
                }}
              >
                <a
                  target={"_blank"}
                  rel={"noopener noopener noreferrer"}
                  href={Constants.manifest?.extra?.discordUrl}
                  style={{ color: "#374151", textDecoration: "none" }}
                >
                  Discord
                </a>
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
          }}
        >
          {/* Steps */}
          <View
            style={{
              flex: 1,
            }}
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
              Get Started
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
                      source={require(`../../assets/step_${step.complete ? "complete" : "soon"
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
                </View>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <View
            style={{
              flex: 1,
              marginLeft: 41,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                fontWeight: "600",
                lineHeight: 32,
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              FAQ
            </Text>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#4B5563",
                  }}
                >
                  What's 3iD for?
                </Text>

                <Image
                  style={{
                    width: 14,
                    height: 7,
                  }}
                  source={require("../../assets/dropdown.png")}
                ></Image>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#4B5563",
                  }}
                >
                  When will be 3ID launched?
                </Text>

                <Image
                  style={{
                    width: 14,
                    height: 7,
                  }}
                  source={require("../../assets/dropdown.png")}
                ></Image>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#4B5563",
                  }}
                >
                  What’s on the roadmap?
                </Text>

                <Image
                  style={{
                    width: 14,
                    height: 7,
                  }}
                  source={require("../../assets/dropdown.png")}
                ></Image>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#4B5563",
                  }}
                >
                  Can I sell my invite card?
                </Text>

                <Image
                  style={{
                    width: 14,
                    height: 7,
                  }}
                  source={require("../../assets/dropdown.png")}
                ></Image>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 16,
                    color: "#4B5563",
                  }}
                >
                  Who is behind the project?
                </Text>

                <Image
                  style={{
                    width: 14,
                    height: 7,
                  }}
                  source={require("../../assets/dropdown.png")}
                ></Image>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Layout>
  );
}
