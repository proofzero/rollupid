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

import Layout from "../AuthLayout";

import { HiLink } from "react-icons/hi";

import * as Clipboard from "expo-clipboard";

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
          <View
            style={{
              flex: 1,
              marginLeft: window.width >= window.height ? 41 : "1em",
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
              Invite Friends
            </Text>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 20,
              }}
            >
              Share an invite link with your friends
            </Text>

            {inviteCode && (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#F9FAFB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "Inter_400Regular",
                    fontWeight: "400",
                    fontSize: 14,
                    lineHeight: 20,
                    paddingVertical: 11,
                    paddingLeft: 13,
                    color: "#9CA3AF",
                  }}
                >
                  https://get.threeid.xyz/{inviteCode}
                </Text>

                <Pressable
                  disabled={!inviteCode}
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#1F2937",
                    paddingVertical: 11,
                    paddingHorizontal: 17,
                  }}
                  onPress={async () => {
                    await Clipboard.setStringAsync(
                      `https://get.threeid.xyz/${inviteCode}`
                    );
                  }}
                >
                  <HiLink
                    style={{
                      width: 15,
                      height: 15,
                      marginRight: 10.5,
                      color: "#D1D5DB",
                    }}
                  />

                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#D1D5DB",
                    }}
                  >
                    Copy Link
                  </Text>
                </Pressable>
              </View>
            )}

            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                fontWeight: "600",
                lineHeight: 32,
                color: "#1F2937",
                marginBottom: 16,
                marginTop: 23,
              }}
            >
              FAQ
            </Text>

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
                    style={{
                      width: 14,
                      height: 7,
                    }}
                    source={require("../../assets/dropdown.png")}
                  ></Image>
                </View>

                <Text
                  style={{
                    marginVertical: "1em",
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Now that you've claimed your 3ID, other applications can query
                  your profile to fetch your public profile details including
                  your avatar. You will also soon be able to use{" "}
                  <Text
                    style={{
                      color: "#D1D5DB",
                    }}
                  >
                    https://threeid.xyz/{account}
                  </Text>{" "}
                  to promote your profile and NFTs on social media.
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  In our roadmap we have many more features coming including
                  linking multiple accounts together, messaging, storage and
                  more.
                </Text>
              </View>
            </View>

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
                    What is the 3ID Roadmap?
                  </Text>

                  <Image
                    style={{
                      width: 14,
                      height: 7,
                    }}
                    source={require("../../assets/dropdown.png")}
                  ></Image>
                </View>

                <Text
                  style={{
                    marginTop: "1em",
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Next we will be focusing on storage, account linking, and
                  messaging but we're also interested in what you think we
                  should be working on! Join us on{" "}
                  <a
                    target={"_blank"}
                    rel={"noopener noopener noreferrer"}
                    href={Constants.manifest?.extra?.discordUrl}
                  >
                    Discord
                  </a>{" "}
                  and{" "}
                  <a
                    target={"_blank"}
                    rel={"noopener noopener noreferrer"}
                    href={Constants.manifest?.extra?.twitterUrl}
                  >
                    Twitter
                  </a>{" "}
                  to share your idea and keep up to date with the{" "}
                  <a
                    target={"_blank"}
                    rel={"noopener noopener noreferrer"}
                    href={`https://www.kubelt.com`}
                  >
                    Kubelt
                  </a>{" "}
                  team.
                </Text>
              </View>
            </View>

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
                    style={{
                      width: 14,
                      height: 7,
                    }}
                    source={require("../../assets/dropdown.png")}
                  ></Image>
                </View>

                <Text
                  style={{
                    marginTop: "1em",
                    fontSize: 14,
                    color: "#9CA3AF",
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
              </View>
            </View>

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
                    What is my new PFP?
                  </Text>

                  <Image
                    style={{
                      width: 14,
                      height: 7,
                    }}
                    source={require("../../assets/dropdown.png")}
                  ></Image>
                </View>

                <Text
                  style={{
                    marginTop: "1em",
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  <Text>
                    Your 3ID gradient PFP is a soulbound avatar made up of 4
                    color traits -- one version color and three common,
                    uncommon, rare and epic colors traits. Rarity is decided by
                    several factors.
                  </Text>

                  <ol>
                    <li>
                      The first color trait probability is based on which
                      popular NFTs you currently hold.
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
                    soul bound to your identity. More generations of this PFP
                    will be released corresponding with every major version of
                    3ID.
                  </Text>
                </Text>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
                fontFamily: "Inter_400Regular",
              }}
            >
              <View
                style={{
                  marginBottom: 16,
                }}
              >
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
                    style={{
                      width: 14,
                      height: 7,
                    }}
                    source={require("../../assets/dropdown.png")}
                  ></Image>
                </View>

                <Text
                  style={{
                    marginTop: "1em",
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  3ID was created by{" "}
                  <a
                    target={"_blank"}
                    rel={"noopener noopener noreferrer"}
                    href={`https://kubelt.com`}
                  >
                    Kubelt
                  </a>
                  , a decentralized application platform, and is inspired by
                  Web3 and the digital identity specification. Instead of
                  applications centralizing user data, 3ID users like yourself
                  will be able to permission/revoke applications to access
                  personal data, messages and more. Our goal is to eliminate
                  email as a basis of online identity and shift the norm towards
                  being cryptographic, user-centric and decentralized platforms.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Layout>
  );
};

export default Onboard;
