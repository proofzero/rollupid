import React, { useEffect, useState, SetStateAction } from "react";
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Pressable, Text, View } from "react-native";

import useAccount from "../../hooks/account";
import Layout from "./Layout";
import { getProfile } from "../provider/kubelt";
import { startView } from "../../analytics/datadog";
import { clearAccount } from "../../provider/web3";
import { Profile } from "../types/Profile";
export default function Gate({ navigation }: { navigation: any }) {

  const [value, setValue] = useState<null | Profile>(null);
  const { getItem, setItem } = useAsyncStorage('@storage_key');

  const readItemFromStorage = async () => {
    const item = await getItem();
    const value: null | Profile = item != null ? JSON.parse(item) : null;
    setValue(value);
  };

  const writeItemToStorage = async (newValue: string) => {
    await setItem(newValue);
    const x: Profile = JSON.parse(newValue);
    setValue(x);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);


  const account = useAccount();

  useEffect(() => {
    if (account === null ) {
      // User maybe disconnected in the process
      navigation.navigate("Landing");
    } else if (account !== undefined){
      console.log("getting profile", account);
      getProfile(account).then(x => JSON.stringify(x)).then(writeItemToStorage) ;
    }
  }, [account]);

  useEffect(() => {
    startView("gate");
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
        <Pressable
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 49,
            paddingTop: 12,
            paddingBottom: 14,
            backgroundColor: "#192030",
            maxWidth: "100%",
            height: 48,
          }}
          onPress={() => clearAccount()}
        >
          <Text
            style={{
              fontFamily: "Manrope_700Bold",
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 22,
              color: "white",
            }}
      > Try Different Wallet
          </Text>
        </Pressable>
        <Text
          style={{
            paddingTop: 56,
            paddingBottom: 43,
            fontFamily: "Inter_700Bold",
            fontSize: 16,
            fontWeight: "20",
            lineHeight: 12,
            color: "#1F2937",
            backgroundColor: 'yellow',
          }}
        >
      ProfilePicture Name: {value?.profilePicture?.name}
        </Text>
        <Text
          style={{
            paddingTop: 56,
            paddingBottom: 43,
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 32,
            color: "#1F2937",
          }}
        >
          Your wallet address is not whitelisted for Early Access.
        </Text>

        <Text
          style={{
            paddingTop: "1em",
            fontFamily: "Inter_400Regular",
            fontSize: 24,
            fontWeight: "400",
            lineHeight: 32,
            color: "#1F2937",
            maxWidth: 758,
            textAlign: "center",
          }}
        >
          To get onto the whitelist{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.twitterUrl}
          >
            follow us on Twitter
          </a>
          ,{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.discordUrl}
          >
            join our Discord
          </a>{" "}
          and leave us a message in{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.discordChannelUrl}
          >
            #3iD
          </a>{" "}
          channel
        </Text>
      </View>
    </Layout>
  );
}
