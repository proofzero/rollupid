import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Link, useNavigationState } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";
import useAccount from "../hooks/account";
import { connect, forceAccounts } from "../provider/web3";
import { Image, ScrollView, View, Text } from "react-native";
import { authenticate, isAuthenticated, kbGetClaims } from "../provider/kubelt";

const SideMenuItem = ({
  title,
  isActive,
  screen,
  icon,
  isCurrent,
}: {
  title: string;
  isActive: boolean;
  screen: string;
  icon: any;
  isCurrent?: boolean;
}) => {
  return (
    <div
      style={{
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 8,
        paddingRight: 9,
        backgroundColor: isCurrent ? "#F3F4F6" : "transparent",
        cursor: isActive ? "pointer" : "default",
      }}
      title={isActive ? title : "Coming soon"}
    >
      {isActive && (
        <Link
          to={{
            screen: `${screen}`,
            params: [],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              resizeMode="center"
              style={{
                width: 20,
                height: 20,
                marginRight: 15,
              }}
              source={icon}
            ></Image>

            <Text
              style={{
                fontFamily: "Manrope_500Medium",
                fontSize: 18,
                lineHeight: 20,
                color: isCurrent ? "#111827" : "gray",
              }}
            >
              {title}
            </Text>
          </View>
        </Link>
      )}

      {!isActive && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            resizeMode="center"
            style={{
              width: 20,
              height: 20,
              marginRight: 15,
            }}
            source={icon}
          ></Image>

          <Text
            style={{
              fontFamily: "Manrope_500Medium",
              fontSize: 18,
              lineHeight: 20,
              color: isCurrent ? "#111827" : "gray",
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </div>
  );
};

export default function Layout({
  children,
  navigation,
}: {
  children: any;
  navigation: any;
}) {
  const { getItem } = useAsyncStorage("kubelt:profile");
  const [nickname, setNickname] = useState<string | undefined>();

  const account = useAccount();

  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (!claims.includes(claim)) {
      navigation.navigate("Landing");
    }
  };

  useEffect(() => {
    if (account === null) {
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        const profile = await getItem();
        if (profile) {
          const profileJson = JSON.parse(profile);
          if (profileJson.nickname) {
            setNickname(profileJson.nickname);
          }
        }
        claimsRedirect(claim);
      } else {
        const provider = await connect(false);

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          claimsRedirect(claim);
        } else {
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

    asyncFn();
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          position: "absolute",
          flex: 1,
          height: "33%",
          backgroundColor: "#192030",
          left: 0,
          right: 0,
          zIndex: -1,
        }}
      ></View>

      <View
        style={{
          flex: 1,
          marginHorizontal: "5em",
          marginVertical: "3em",
        }}
      >
        <NavMenu />

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginBottom: "3em",
            shadowRadius: 5,
            shadowOpacity: 0.1,
          }}
        >
          <View
            style={{
              width: 240,
              backgroundColor: "#F9FAFB",
              paddingHorizontal: 16,
              paddingVertical: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginBottom: 15,
              }}
            >
              <Image
                style={{
                  width: 48,
                  height: 48,
                  marginRight: 12,
                }}
                source={require("../assets/avatar.png")}
              ></Image>

              <View
                style={{
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    marginBottom: 8,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    fontWeight: "600",
                    lineHeight: 19.36,
                    color: "#1A1B2D",
                    flex: 1,
                  }}
                >
                  {nickname || account?.substring(0, 6)}
                </Text>

                <Link
                  style={{
                    marginBottom: 8,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    fontWeight: "600",
                    lineHeight: 15,
                    textDecorationLine: "underline",
                    color: "#3B63FF",
                    flex: 1,
                  }}
                  to={{ screen: "Settings" }}
                >
                  Visit My Profile
                </Link>
              </View>
            </View>

            <View>
              <SideMenuItem
                isActive={true}
                isCurrent={navRoutes[navIndex].name === "Onboard"}
                screen={"Onboard"}
                title={"Dashboard"}
                icon={require("../assets/menu/side/dashboard.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"Set PFP"}
                icon={require("../assets/menu/side/set-pfp.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"User Details"}
                icon={require("../assets/menu/side/user-details.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"Wallet Accounts"}
                icon={require("../assets/menu/side/wallet-accounts.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"NFT Gallery"}
                icon={require("../assets/menu/side/nft-gallery.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"KYC"}
                icon={require("../assets/menu/side/kyc.png")}
              />
              <SideMenuItem
                isActive={false}
                screen={""}
                title={"Connected dApps"}
                icon={require("../assets/menu/side/connected-d-apps.png")}
              />
            </View>
          </View>

          <View
            style={{
              flex: 8,
              backgroundColor: "#FFFFFF",
              paddingVertical: "2em",
              paddingHorizontal: "3em",
            }}
          >
            {children}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
