import React, { useEffect, useState, SetStateAction } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { StyleSheet, Pressable, Text, View, TextInput } from "react-native";

import useAccount from "../../hooks/account";
import Layout from "../Layout";
import { kbGetProfile, kbSetProfile } from "../../provider/kubelt";
import { startView } from "../../analytics/datadog";
import { clearAccount } from "../../provider/web3";
import { Profile } from "../../types/Profile";

export default function Settings({ navigation }: { navigation: any }) {
  // TODO: Add forms library
  const bioLimit = 300;
  const setBio = (bio: string) => {
    if (bio.length < bioLimit) {
      setProfile((p) => ({ ...p, bio }));
    }
  };

  const emptyProfile: Profile = {
    nickname: "",
    bio: "",
    job: "",
    location: "",
    website: "",
    email: "",
  };

  const [profile, setProfile] = useState<Profile>(emptyProfile);

  // TODO: Use correct storage key
  const { getItem, setItem } = useAsyncStorage("@storage_key");

  const readItemFromStorage = async () => {
    const item = await getItem();
    const value: Profile = item != null ? JSON.parse(item) : emptyProfile;
    setProfile(value);
  };

  const writeItemToStorage = async (newValue: string) => {
    await setItem(newValue);
    const x: Profile = JSON.parse(newValue);
    setProfile(x);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  const account = useAccount();

  useEffect(() => {
    if (!!account) {
      kbGetProfile(account)
        .then((x) => {
          setProfile(x || emptyProfile);
          return JSON.stringify(x || emptyProfile);
        })
        .then(writeItemToStorage);
    }
  }, [account]);

  const saveAllChanges = async (profile: Profile, setProfile: Function) => {
    if (account !== null && account !== undefined) {
      console.log("saving!");
      kbSetProfile(account, profile)
        .then((x) => {
          setProfile(x);
          return JSON.stringify(x);
        })
        .then(writeItemToStorage);
    }
  };

  return (
    <Layout>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.view}>
          <Text style={styles.text}> Nickname </Text>
          <TextInput
            style={styles.textinput}
            value={profile.nickname}
            onChangeText={(nickname) => setProfile((p) => ({ ...p, nickname }))}
          />
          <Text style={styles.text}> Job </Text>
          <TextInput
            style={styles.textinput}
            value={profile.job}
            onChangeText={(job) => setProfile((p) => ({ ...p, job }))}
          />
          <Text style={styles.text}> Location </Text>
          <TextInput
            style={styles.textinput}
            value={profile.location}
            onChangeText={(location) => setProfile((p) => ({ ...p, location }))}
          />
          <Text style={styles.text}> Website </Text>
          <TextInput
            style={styles.textinput}
            value={profile.website}
            onChangeText={(website) => setProfile((p) => ({ ...p, website }))}
          />
          <Text style={styles.text}> Email </Text>
          <TextInput
            style={styles.textinput}
            value={profile.email}
            onChangeText={(email) => setProfile((p) => ({ ...p, email }))}
          />
          <Text style={styles.text}> Bio </Text>
          <TextInput
            style={styles.textarea}
            value={profile.bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <Pressable
            style={styles.button}
            onPress={() => saveAllChanges(profile, setProfile)}
          >
            <Text style={styles.textButton}> Save all Changes </Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  textinput: {
    height: 26,
    borderWidth: 0.5,
    borderColor: "#0f0f0f",
    padding: 4,
    marginVertical: "1rem",
  },
  textarea: {
    height: 66,
    borderWidth: 0.5,
    borderColor: "#0f0f0f",
    padding: 4,
    marginVertical: "1rem",
  },
  view: {
    borderWidth: 0.5,
    borderColor: "#0f0f0f",
    padding: 50,
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 12,
    color: "#1F2937",
  },
  textButton: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    color: "white",
  },
  button: {
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
  },
});
