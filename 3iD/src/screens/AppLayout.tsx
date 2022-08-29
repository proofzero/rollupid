import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

import { Image, View, Text, Pressable, SafeAreaView } from "react-native";
import NavMenu from "../components/nav-menu/NavMenu";
import useAccount from "../hooks/account";
import { useAppDispatch } from "../hooks/state";
import {
  authenticate,
  getSDK,
  isAuthenticated,
  kbGetClaims,
} from "../provider/kubelt";
import { connect, forceAccounts } from "../provider/web3";
import { fetchProfile } from "../services/threeid";
import { set } from "../state/slices/profile";

export default function AppLayout({
  children,
  navigation,
  account,
}: {
  children: any;
  navigation: any;
  account: string;
}) {
  const { getItem, setItem } = useAsyncStorage("kubelt:profile");

  const dispatch = useAppDispatch();

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (!claims.includes(claim)) {
      navigation.navigate("Landing");
    }
  };

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
    <View
      style={{
        flex: 1,
      }}
    >
      <NavMenu />

      <View
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        {children}
      </View>
    </View>
  );
}
