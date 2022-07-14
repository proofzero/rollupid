import React, { useEffect, useState, SetStateAction } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { StyleSheet, Pressable, Text, View, TextInput } from "react-native";

import useAccount from "../../hooks/account";
import Layout from "../AuthLayout";
import {
  authenticate,
  isAuthenticated,
  kbGetProfile,
  kbSetProfile,
} from "../../provider/kubelt";
import { startView } from "../../analytics/datadog";
import { clearAccount, connect } from "../../provider/web3";
import { Profile } from "../../types/Profile";

import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

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
    const asyncFn = async () => {
      if (account != null && account != undefined) {
        let address = account;

        if (!(await isAuthenticated(account))) {
          const provider = await connect(false);
          await authenticate(provider, true);

          const signer = provider.getSigner();
          address = await signer.getAddress();
        }

        kbGetProfile(address)
          .then((x) => {
            setProfile(x || emptyProfile);
            return JSON.stringify(x || emptyProfile);
          })
          .then(writeItemToStorage);
      }
    };

    asyncFn();
  }, [account]);

  const saveAllChanges = async (profile: Profile, setProfile: Function) => {
    if (account !== null && account !== undefined) {
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
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              paddingBottom: "1em",
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              fontWeight: "700",
              lineHeight: 28,
              color: "#1F2937",
            }}
          >
            Profile
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => saveAllChanges(profile, setProfile)}
          >
            <Text style={styles.textButton}> Save all Changes </Text>
          </Pressable>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 36,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 38,
              }}
            >
              <Text style={styles.label}> Nickname </Text>

              <View>
                <View
                  style={{
                    position: "absolute",
                    width: 41,
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: -1,
                  }}
                >
                  <Entypo style={{}} name="email" size={16} color="#9CA3AF" />
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Your Nickname"
                  placeholderTextColor={"#D1D5DB"}
                  value={profile.nickname}
                  onChangeText={(nickname) =>
                    setProfile((p) => ({ ...p, nickname }))
                  }
                />
              </View>
            </View>

            {/* Hide for mobile */}
            <View
              style={{
                flex: 1,
              }}
            ></View>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 36,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 19,
              }}
            >
              <Text style={styles.label}> Job </Text>
              <View>
                <View
                  style={{
                    position: "absolute",
                    width: 41,
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: -1,
                  }}
                >
                  <Entypo
                    style={{}}
                    name="suitcase"
                    size={16}
                    color="#9CA3AF"
                  />
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Your job"
                  placeholderTextColor={"#D1D5DB"}
                  value={profile.job}
                  onChangeText={(job) => setProfile((p) => ({ ...p, job }))}
                />
              </View>
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 19,
              }}
            >
              <Text style={styles.label}> Location </Text>

              <View>
                <View
                  style={{
                    position: "absolute",
                    width: 41,
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: -1,
                  }}
                >
                  <Entypo
                    style={{}}
                    name="location-pin"
                    size={16}
                    color="#9CA3AF"
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your location"
                  placeholderTextColor={"#D1D5DB"}
                  value={profile.location}
                  onChangeText={(location) =>
                    setProfile((p) => ({ ...p, location }))
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 36,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 19,
              }}
            >
              <Text style={styles.label}> Website </Text>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#F9FAFB",
                    paddingHorizontal: "1em",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    zIndex: -1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 16,
                      color: "#6B7280",
                    }}
                  >
                    http://
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <TextInput
                    style={{
                      height: 26,
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      paddingTop: "1em",
                      paddingBottom: "1em",
                      paddingLeft: 90,
                      fontFamily: "Inter400_Regular",
                      fontStyle: "normal",
                      fontSize: 16,
                      lineHeight: 24,
                      shadowColor: "#D1D5DB",
                      shadowRadius: 2,
                    }}
                    value={profile.website}
                    onChangeText={(website) =>
                      setProfile((p) => ({ ...p, website }))
                    }
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 19,
              }}
            >
              <Text style={styles.label}> Email </Text>
              <View>
                <View
                  style={{
                    position: "absolute",
                    width: 41,
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: -1,
                  }}
                >
                  <MaterialIcons name="email" size={16} color="#9CA3AF" />
                </View>

                <TextInput
                  style={styles.textInput}
                  value={profile.email}
                  placeholder="Your Email"
                  placeholderTextColor={"#D1D5DB"}
                  onChangeText={(email) => setProfile((p) => ({ ...p, email }))}
                />
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.label}> Bio </Text>

            <TextInput
              style={styles.textarea}
              value={profile.bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  textInput: {
    height: 26,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingTop: "1em",
    paddingBottom: "1em",
    paddingLeft: 36,
    fontFamily: "Inter400_Regular",
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: 24,
    shadowColor: "#D1D5DB",
    shadowRadius: 2,
  },
  textarea: {
    height: 66,
    padding: 4,
    shadowColor: "#D1D5DB",
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontFamily: "Inter400_Regular",
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: 24,
  },
  view: {
    borderWidth: 0.5,
    borderColor: "#0f0f0f",
    padding: 50,
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 20,
    color: "#374151",
    paddingBottom: 7,
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
    paddingHorizontal: 13.5,
    paddingVertical: 14,
    backgroundColor: "#192030",
    maxWidth: "100%",
    height: 48,
  },
});
