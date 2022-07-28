import React, { useEffect, useState } from "react";
import Layout from "../AuthLayout";

import useProfile from "../../hooks/profile";
import { View, Text } from "react-native";

export default function Details({
  navigation,
}: {
  children: any;
  navigation: any;
}) {
  const profile = useProfile();

  return (
    <Layout navigation={navigation}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <Text>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </Text>
      </View>
    </Layout>
  );
}
