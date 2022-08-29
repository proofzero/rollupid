import React, { useEffect, useState } from "react";
import Layout from "../AppLayout";

import {
  View,
  Text,
  StyleSheet,
  Image,
  Touchable,
  Pressable,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import useAccount from "../../hooks/account";
import { useAppSelector } from "../../hooks/state";

export default function Details({
  navigation,
  children,
  route,
}: {
  children: any;
  navigation: any;
  route: any;
}) {
  const profile = useAppSelector((state) => state.profile.value);
  const account =
    route.params && route.params.account ? route.params.account : useAccount();

  return (
    <Layout navigation={navigation} account={account}>
      {profile && (
        <View
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              height: 300,
              background: "#abc",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          ></div>

          <View
            style={{
              position: "absolute",
              width: 286,
              height: 404,
              backgroundColor: "white",
              shadowRadius: 5,
              shadowColor: "rgb(0, 0, 0)",
              shadowOpacity: 0.2,
              justifyContent: "center",
              alignItems: "center",
              left: 84,
              top: 82,
            }}
          >
            <div
              style={{
                width: 174,
                height: 174,
                clipPath:
                  "polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)",
                boxShadow: "inset 0px 10px 100px 10px white",
                transform: "scale(1.2)",
                marginBottom: 18,
              }}
            >
              <Image
                style={{
                  width: 174,
                  height: 174,
                }}
                source={require("../../assets/mint_large.png")}
              />
            </div>

            <>
              {profile.nickname && (
                <Text style={styles.card.nickname}>{profile.nickname}</Text>
              )}
              {account && (
                <Text style={styles.card.account}>{`${account.substring(
                  0,
                  4
                )}...${account.substring(account.length - 6)}`}</Text>
              )}
            </>
          </View>

          <View
            style={{
              marginLeft: 400,
              marginRight: "5em",
              padding: "1em",
              marginBottom: 85,
            }}
          >
            <>
              {profile.bio && (
                <View
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <Text>{profile.bio}</Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  borderTopColor: "#E5E7EB",
                  borderTopWidth: 1,
                  paddingTop: 24,
                }}
              >
                <>
                  {profile.location && (
                    <View style={styles.field.wrapper}>
                      <Entypo
                        style={styles.field.icon}
                        name="location-pin"
                        size={16}
                        color="#9CA3AF"
                      />

                      <Text style={styles.field.text}>{profile.location}</Text>
                    </View>
                  )}
                </>

                <>
                  {profile.job && (
                    <View style={styles.field.wrapper}>
                      <Entypo
                        style={styles.field.icon}
                        name="suitcase"
                        size={16}
                        color="#9CA3AF"
                      />

                      <Text style={styles.field.text}>{profile.job}</Text>
                    </View>
                  )}
                </>
              </View>
            </>
          </View>

          <View
            style={{
              margin: "5em",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#4B5563",
              }}
            >
              NFT collection
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-start",
                marginBottom: 44,
              }}
            >
              <Image
                style={{
                  width: 127,
                  height: 119,
                }}
                source={require("../../assets/find.svg")}
              />

              <View
                style={{
                  marginLeft: 37.61,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 30,
                    fontWeight: "700",
                    lineHeight: 40,
                    color: "#9CA3AF",
                  }}
                >
                  Oh no!
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 24,
                    fontWeight: "500",
                    lineHeight: 32,
                    color: "#9CA3AF",
                  }}
                >
                  Looks like you don't own any NFTs
                </Text>
              </View>
            </View>

            <View
              style={{
                marginBottom: 26,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 18,
                  fontWeight: "500",
                  lineHeight: 24,
                  color: "#4B5563",
                }}
              >
                Not sure where to start?
              </Text>

              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  fontWeight: "400",
                  lineHeight: 24,
                  color: "#9CA3AF",
                }}
              >
                Here is a list of popular marketplaces.
              </Text>
            </View>

            <View
              style={{
                marginBottom: 46,
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
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
                      width: 73,
                      height: 73,
                      marginRight: 19,
                    }}
                    source={require("../../assets/opensea.png")}
                  />

                  <View>
                    <Text>OpenSea</Text>
                    <Text>
                      The world’s largest digital marketplace for crypto
                      collectibles and non-fungible tokens (NFTs), including
                      ERC721 and ERC1155 assets.{" "}
                    </Text>
                  </View>
                </View>

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
                  <Text
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
                      href="https://opensea.io/"
                      style={{ color: "#374151", textDecoration: "none" }}
                    >
                      Visit Website
                    </a>
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
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
                      width: 73,
                      height: 73,
                      marginRight: 19,
                    }}
                    source={require("../../assets/rarible.png")}
                  />

                  <View>
                    <Text>Rarible</Text>
                    <Text>
                      Rarible is a community-owned NFT marketplace, it awards
                      the RARI token to active users on the platform, who buy or
                      sell on the NFT marketplace.
                    </Text>
                  </View>
                </View>

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
                  <Text
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
                      href="https://rarible.com/"
                      style={{ color: "#374151", textDecoration: "none" }}
                    >
                      Visit Website
                    </a>
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                      width: 73,
                      height: 73,
                      marginRight: 19,
                    }}
                    source={require("../../assets/superrare.png")}
                  />

                  <View>
                    <Text>SuperRare</Text>
                    <Text>
                      SuperRare has a strong focus on being a marketplace for
                      people to buy and sell unique, single-edition digital
                      artworks.
                    </Text>
                  </View>
                </View>

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
                  <Text
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
                      href="https://superrare.com/"
                      style={{ color: "#374151", textDecoration: "none" }}
                    >
                      Visit Website
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
              <View
                style={{
                  flex: 1,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    marginBottom: 46,
                    fontFamily: "Inter_500Medium",
                    fontSize: 18,
                    fontWeight: "500",
                    lineHeight: 24,
                  }}
                >
                  Mint your own NFT on Polygon
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        padding: 20,
                        backgroundColor: "#F9FAFB",
                        marginRight: 19,
                      }}
                    >
                      <Image
                        style={{
                          width: 35,
                          height: 30.8,
                        }}
                        source={require("../../assets/polygon.png")}
                      />
                    </View>

                    <View>
                      <Text>Mintnft.Today</Text>
                    </View>
                  </View>

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
                    <Text
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
                        href="https://mintnft.today/"
                        style={{ color: "#374151", textDecoration: "none" }}
                      >
                        Visit Website
                      </a>
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    marginBottom: 46,
                    fontFamily: "Inter_500Medium",
                    fontSize: 18,
                    fontWeight: "500",
                    lineHeight: 24,
                  }}
                >
                  What's an NFT?
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        padding: 20,
                        backgroundColor: "#F9FAFB",
                        marginRight: 19,
                      }}
                    >
                      <Image
                        style={{
                          width: 35,
                          height: 30.8,
                        }}
                        source={require("../../assets/book.png")}
                      />
                    </View>

                    <View>
                      <Text>Learn About NFTs</Text>
                    </View>
                  </View>

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
                    <Text
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
                        href="https://ethereum.org/en/nft/"
                        style={{ color: "#374151", textDecoration: "none" }}
                      >
                        Visit Website
                      </a>
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </Layout>
  );
}

const styles = {
  card: {
    nickname: {
      fontFamily: "Manrope_700Bold",
      fontSize: 24,
      lineHeight: 32.78,
    },
    account: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      lineHeight: 15,
      color: "#9CA3AF",
    },
  },
  field: StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: "2em",
    },
    icon: {
      marginRight: "0.5em",
    },
    textarea: {
      fontFamily: "Inter_500Medium",
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 24,
      color: "#6B7280",
    },
    text: {
      fontFamily: "Inter_500Medium",
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 22,
      color: "#6B7280",
    },
  }),
};
