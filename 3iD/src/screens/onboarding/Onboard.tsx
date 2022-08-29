import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { FaDiscord, FaTwitter, FaCaretUp } from "react-icons/fa";
import ReactTooltip from 'react-tooltip';
import styled from "styled-components";

import { View, Text, Image, Pressable } from "react-native";
import LinkButton from "../../components/buttons/LinkButton";
import useAccount from "../../hooks/account";
import datadogRum from "../../analytics/datadog";
import { authenticate, getSDK, isAuthenticated } from "../../provider/kubelt";
import { 
  getFunnelState,
  getInviteCode,
  getFeatureVoteCount,
  setFeatureVoteCount,
} from "../../services/threeid";

import FAQ from "./FAQ";

import Layout from "../AuthLayout";
import InviteCode from "../../components/invites/InviteCode";
import useBreakpoint from "../../hooks/breakpoint";
import { connect } from "../../provider/web3";

type OnboardProps = {
  navigation: any;
};

const Onboard = ({ navigation }: OnboardProps) => {
  const account = useAccount();

  const [upvoteButtons, setUpvoteButtons] = useState([]);

  const [inviteCode, setInviteCode] = useState<string | undefined>();

  const [featureVotes, setFeatureVotes] = useState<Set<string>>(new Set<string>());

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
      description: (
        <>
          Mint your very own 3ID 1/1 PFP. <br></br>
          For more information see "What is the 3ID?"" PFP in the FAQ section.
        </>
      ),
    },
    {
      title: "Verify ENS",
      description: (
        <>
          Connect your ENS name to your 3ID. <br></br>
          Use your ENS name as your username for easier profile discovery.
        </>
      ),
    },
    {
      title: "Configure Profile",
      description: (
        <>
          Configure your NFT avatar and profile. <br></br>
          Tell the world about yourself...or don't! It's up to you.
        </>
      ),
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
      title: "Receive First Credential",
    },
    {
      title: "Setup Secure KYC",
    },
    {
      title: "Send First Message",
    },
    {
      title: "Publish First File",
    },
    {
      title: "Permission First App",
    },
  ]);

  const percentage =
    (completeSteps.length /
      (completeSteps.length + comingNext.length + roadmapSteps.length)) * 100;

    useEffect(() => {
      const asyncFn = async () => {
        
        let isAuth = await isAuthenticated(account);
        if (!isAuth) {
          const provider = await connect();
          await authenticate(provider);
        }
  
        isAuth = await isAuthenticated(account);
        if (isAuth) {
          const sdk = await getSDK();
  
          const funnelState = await getFunnelState(sdk);
          if (!funnelState.mint) {
            // setCanMint(true);
          }
  
          const inviteCodeRes = await getInviteCode(sdk);
          if (inviteCodeRes) {
            setInviteCode(inviteCodeRes);
          }
  
          const featureVotesRes = await getFeatureVoteCount(sdk);
          console.log(featureVotesRes);
          if (featureVotesRes?.votes) {
            setFeatureVotes(new Set(featureVotesRes.votes));
          }
        }
      };
  
      if (account) {
        asyncFn();
      }
    }, [account]);

  useEffect(() => {
    const asyncFn = async () => {
      const sdk = await getSDK();
      setFeatureVoteCount(sdk, {votes: Array.from(featureVotes)})
    }

    if (featureVotes) {
      asyncFn();
    }


  }, [featureVotes]);

  const TooltipWrapper = styled.span`
    .tooltip {
      position: absolute !important;
      width: fit-content !important;
      left: inherit !important;
      top: inherit !important;
      margin-top: -60px !important;
      margin-left: -86px !important;
      fontFamily: "Inter_400Regular";
  `;

  const UpvoteButtonWrapper = styled.span`
      button:active {
        transform: scale(0.9);
      }
      button:hover {
        cursor: pointer;
      }
      button[disabled] {
        opacity: 0.2;
        color: #fff;
      }
  `;

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
              textAlign: useBreakpoint(false, true) ? "center" : "left",
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
              flexDirection: useBreakpoint("row", "column"),
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
            flexDirection: useBreakpoint("row", "column"),
          }}
        >
          {!useBreakpoint(true, false) && inviteCode && (
            <InviteCode invite={inviteCode} />
          )}

          {/* Steps */}
          <View
            style={
              useBreakpoint(true, false)
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
                    flexShrink: 1,
                    justifyContent: "space-between",
                    marginBottom: index !== comingNext.length - 1 ? 32 : 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flexShrink: 1,
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

                    <View style={{
                      flexShrink: 1,

                    }}>
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
                          color: "#4B5563",
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
              TELL US WHAT'S NEXT
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                fontWeight: "400",
                lineHeight: 20,
                color: "#9CA3AF",
                marginBottom: 20,
                // marginTop: 5,
              }}
            >
              Vote for your favorite features ({3 - featureVotes.size} votes left)
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
                    <UpvoteButtonWrapper>

                      <button
                        disabled={(featureVotes.size >= 3 || featureVotes.has(step.title)) ? true : false}
                        style={{
                          width: 42,
                          height: 42,
                          marginRight: 19.2,
                          fontWeight: "700",
                          fontSize: 18,
                          backgroundColor: "#F3F4F6",
                          border: "none",
                          color: "#111827",
                          paddingTop: 12,
                        }}
                        onClick={() => { 
                          // upvoteButtons.map((ref, i) => ReactTooltip.hide(ref))
                          ReactTooltip.show(upvoteButtons[index]) 
                        }}
                      >
                          <FaCaretUp />
                        <p
                          ref={ref => {
                            upvoteButtons[index] = ref
                            setUpvoteButtons(upvoteButtons)
                            return ref
                          }}
                          data-tip={`Upvoted!`} 
                          // data-delay-show='100' 
                          data-delay-hide='1500'
                          data-effect='solid'
                          data-for={`tooltip_${index}`}
                          data-place='top'
                          data-scroll-hide='true'
                        ></p>
                      </button>
                    </UpvoteButtonWrapper>

                    <TooltipWrapper>
                      { React.useMemo(() => (<ReactTooltip 
                            className="tooltip"
                            id={`tooltip_${index}`}
                            scrollHide={true} 
                            afterShow={() => {
                              
                              ReactTooltip.hide(upvoteButtons[index])
                            }}
                            afterHide={() => {
                              // Set upvotes
                              if (featureVotes.size < 3) {
                                featureVotes.add(step.title)
                                setFeatureVotes(new Set(featureVotes))
                                datadogRum.addAction('featureVote', {
                                  'value': step.title,
                                })
                              }
                            }}
                          />), [])}
                      </TooltipWrapper>
                         
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
