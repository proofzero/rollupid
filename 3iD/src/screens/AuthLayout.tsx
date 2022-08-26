import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Link, useNavigationState } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import NavMenu from "../components/nav-menu/NavMenu";
import useAccount from "../hooks/account";
import { connect, forceAccounts } from "../provider/web3";
import {
  Image,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  authenticate,
  getSDK,
  isAuthenticated,
  kbGetClaims,
} from "../provider/kubelt";
import { useAppDispatch, useAppSelector } from "../hooks/state";
import { selectNickname, set } from "../state/slices/profile";
import { fetchProfile } from "../services/threeid";
import SideMenu from "../components/side-menu/SideMenu";

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
  const dispatch = useAppDispatch();
  const nickname = useAppSelector(selectNickname);

  const { getItem, setItem } = useAsyncStorage("kubelt:profile");

  const account = useAccount();
  const window = useWindowDimensions();

  const loadProfile = async () => {
    const storedProfile = await getItem();
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);

      dispatch(set(parsedProfile));
    } else {
      const sdk = await getSDK();
      const fetchedProfile = await fetchProfile(sdk);

      dispatch(set(fetchedProfile));

      await setItem(JSON.stringify(fetchedProfile));
    }
  };

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
        await loadProfile();
        await claimsRedirect(claim);
      } else {
        const provider = await connect(false);

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await loadProfile();
          await claimsRedirect(claim);
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
          backgroundColor: "#192030",
          zIndex: 1,
        }}
      >
        <NavMenu />
      </View>

      <View
        style={{
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            height: 300,
            left: 0,
            right: 0,
            backgroundColor: "#192030",
          }}
        ></View>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: window.width >= window.height ? "row" : "column",
          shadowRadius: 5,
          shadowOpacity: 0.1,
          width: Math.min(1400, window.width),
          marginHorizontal: "auto",
          marginVertical: "3em",
        }}
      >
        {nickname && <SideMenu nickname={nickname} />}

        <View
          style={{
            flex: 8,
            backgroundColor: "#FFFFFF",
            padding: "1em",
          }}
        >
          {children}
        </View>
      </View>
    </ScrollView>
  );
}
