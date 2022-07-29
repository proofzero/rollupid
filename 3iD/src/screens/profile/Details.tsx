import React, { useEffect, useState } from "react";
import Layout from "../AppLayout";

import { Profile } from "../../types/Profile";
import {humanAccount, useProfile, emptyProfile} from "../../hooks/profile";
import { View, Text, StyleSheet, Image } from "react-native";

import { Entypo } from "@expo/vector-icons";
import useAccount from "../../hooks/account";


const renderPFP = (profile: Profile, account: string) => {
  console.log("yayayayay", {uri: profile?.profilePicture?.imageUrl});
  const tinyLogo = {
    width: "50%",
    height: "50%"
  };
  return (<View
    style={{
      width: 286,
      height: 404,
      backgroundColor: "white",
      shadowRadius: 5,
      shadowColor: "rgb(0, 0, 0)",
      shadowOpacity: 0.2,
    }}
  >
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 286,
        height: 304,

      }}
    >
      <Image style={tinyLogo}
        source={{ uri: profile?.profilePicture?.imageUrl }} />
      <Text style={styles.card.nickname}>YUP {profile?.nickname && profile.nickname}</Text>
      <Text>{profile.nickname && account && humanAccount(account)}</Text>
    </View>
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",

        width: 286,
        height: 100,

        display: "flex",
        flexDirection: "row",
        flex: 1,
      }}
    >

      <Entypo
        style={styles.field.icon}
        name="globe"
        size={16}
        color="#9CA3AF"
      />
      <Entypo
        style={styles.field.icon}
        name="twitter"
        size={16}
        color="#9CA3AF"
      />

    </View>

  </View>)

};


export default function Details({
  navigation,
}: {
  children: any;
  navigation: any;
}) {
  const account = useAccount();

  const persistedProfile = useProfile();
  const [profile, setProfile] = useState(persistedProfile);

  useEffect(() => {
      console.log(JSON.stringify(profile, null, 2));
      setProfile(persistedProfile);
  }, [persistedProfile]);



  return (
    <Layout navigation={navigation}>
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
        }}
      >
        <View
          style={{
            flexDirection: "row",
          }}
        >

    {renderPFP(profile, account as string)}
      <View
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            ></View>

            <View
              style={{
                flex: 1,
                padding: "1em",
              }}
            >


              <View
                style={{
                  flex: 1,
                }}
              >
                <Text>{profile.bio}</Text>
              </View>
              <hr />

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                  }}
                >
                  <View style={styles.field.wrapper}>
                    <Entypo
                      style={styles.field.icon}
                      name="location-pin"
                      size={16}
                      color="#9CA3AF"
                    />
                    <Text style={styles.field.text}>{profile?.location && profile.location}</Text>
                  </View>
                  <View style={styles.field.wrapper}>
                    <Entypo
                      style={styles.field.icon}
                      name="suitcase"
                      size={16}
                      color="#9CA3AF"
                    />

                    <Text style={styles.field.text}>{profile?.job && profile.job}</Text>
                  </View>
                </View>

              </View>
            </View>


          </View>
        </View>

      </View>


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
    text: {},
  }),
};
