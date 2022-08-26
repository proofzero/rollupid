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
import { NONE } from "../../../../packages/sdk-web/lib/cljs.core";
import InviteCode from "../../components/invites/InviteCode";

type OnboardProps = {
  navigation: any;
};

const Onboard = ({ navigation }: OnboardProps) => {
  const account = useAccount();
  const window = useWindowDimensions();
  const landscape = window.width >= window.height;

  const [inviteCode, setInviteCode] = useState<string | undefined>();

  const [canMint, setCanMint] = useState(false);

  const [completeSteps] = useState<
    {
      title: string;
    }[]
  >([
    {
      title: "Claim your 3ID",
    },
  ]);

  const [comingNext] = useState<
    {
      title: string;
      description: Any;
    }[]
  >([
    {
      title: "Claim your PFP",
      description: (<>Mint your very own 3ID 1/1 PFP. <br></br>
      For more information see "What is the 3ID?"" PFP in the
      FAQ section.</>),
    },
    {
      title: "Verify ENS",
      description: (<>Connect your ENS name to your 3ID. <br></br>
      Use your ENS name as your username for easier profile discovery.</>),
    },
    {
      title: "Configure Profile",
      description: (<>Configure your NFT avatar and profile. <br></br>
      Tell the world about yourself...or don't! It's up to you.</>),
    },
  ]);

  const [roadmapSteps] = useState<
    {
      title: string;
    }[]
  >([
    {
      title: "Create NFT gallery",
    },
    {
      title: "Link More Accounts",
    },
    {
      title: "Receive First Verified Credential",
    },
    {
      title: "Setup Secure KYC",
    },
    {
      title: "Send First Message",
    },
    {
      title: "Save First File",
    },
    {
      title: "Permission First App",
    },
  ]);

  const percentage =
    (completeSteps.length /
      (completeSteps.length + comingNext.length + roadmapSteps.length)) *
    100;

  useEffect(() => {
    const asyncFn = async () => {
      const sdk = await getSDK();

      const funnelState = await getFunnelState(sdk);
      if (!funnelState.mint) {
        // setCanMint(true);
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
            Thanks for being an early supporter! We will be unlocking new
            features regularly. <br />
            Check out what's coming next. Be sure to follow us on Twitter and
            Discord to stay updated!{" "}
          </Text>

          <View
            style={{
              flexDirection: landscape ? "row" : "column",
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
            flexDirection: landscape ? "row" : "column",
          }}
        >
          {!landscape && inviteCode && <InviteCode code={inviteCode} />}

          {/* Steps */}
          <View
            style={
              landscape
                ? {
                    flex: 1,
                  }
                : {
                    marginBottom: "1em",
                    marginTop: "1em",
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
                marginBottom: 20,
                marginTop: 10,
              }}
            >
              Discover and try new features as we roll them out.
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
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 7,
              }}
            >
              READY
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#F3F4F6",
                padding: 17,
              }}
            >
              {completeSteps.map((step, index) => (
                <View
                  key={step.title}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: index !== completeSteps.length - 1 ? 32 : 0,
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
                      source={require(`../../assets/step_complete.png`)}
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
                            fontFamily: "Inter_500Medium",
                            fontSize: 14,
                            fontWeight: "500",
                            lineHeight: 24,
                            color: "#6B7280",
                          }}
                        >
                          Completed
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* COMING NEXT */}
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 7,
                marginTop: 20,
              }}
            >
              COMING NEXT
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#F3F4F6",
                padding: 17,
              }}
            >
              {comingNext.map((step, index) => (
                <View
                  key={step.title}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: index !== comingNext.length - 1 ? 32 : 0,
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
                      source={require(`../../assets/step_soon.png`)}
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

                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          fontWeight: "400",
                          lineHeight: 20,
                          color: "#D1D5DB",
                        }}
                      >
                        {step.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ROADMAP */}
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 7,
                marginTop: 20,
              }}
            >
              ROADMAP
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#F3F4F6",
                padding: 17,
              }}
            >
              {roadmapSteps.map((step, index) => (
                <View
                  key={step.title}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: index !== roadmapSteps.length - 1 ? 32 : 0,
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
                      source={require(`../../assets/step_soon.png`)}
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

                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          fontWeight: "400",
                          lineHeight: 24,
                          color: "#D1D5DB",
                        }}
                      >
                        Coming Soon
                      </Text>
                    </View>
                  </View>
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
