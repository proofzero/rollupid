import React from "react";

import { View } from "react-native";

import Layout from "../AuthLayout";

export default function Onboard({ navigation }: { navigation: any }) {
  return (
    <Layout navigation={navigation}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      ></View>
    </Layout>
  );
}
