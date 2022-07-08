import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useColorScheme, View } from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import { Manrope_700Bold } from "@expo-google-fonts/manrope";

import Landing from "./screens/Landing";
import Auth from "./screens/Auth";
import Gate from "./screens/Gate";

import AppLoading from "expo-app-loading";

import { Helmet } from "react-helmet";
import { Asset, useAssets } from "expo-asset";
import { useEffect, useState } from "react";

const Stack = createNativeStackNavigator();

export default function App() {
  const [assets, assetError] = useAssets([
    require("./assets/Favicon.ico"),
    require("./assets/Favicon_Darkmode.ico"),
    require("./assets/Favicon.png"),
    require("./assets/Favicon_Darkmode.png"),
    require("./assets/Favicon.svg"),
    require("./assets/Favicon_Darkmode.svg"),
  ]);

  const [helmetAssets, setHelmetAssets] = useState<undefined | {
    iconPng: Asset,
    iconSvg: Asset,
    favicon: Asset
  }>()

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Manrope_700Bold,
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!assetError && assets) {
      setHelmetAssets({
        favicon: colorScheme === "dark" ? assets[1] : assets[0],
        iconPng: colorScheme === "dark" ? assets[3] : assets[2],
        iconSvg: colorScheme === "dark" ? assets[5] : assets[4]
      })
    }
  }, [colorScheme, assets, assetError])

  const IconHelmet = helmetAssets && <Helmet>
    <link rel="icon" href={helmetAssets.favicon.uri} sizes="any"></link>
    <link rel="icon" href={helmetAssets.iconPng.uri} type="image/png"></link>
    <link rel="icon" href={helmetAssets.iconSvg.uri} type="image/svg+xml"></link>
  </Helmet>;

  if (!fontsLoaded) {
    return (
      <>
        {IconHelmet}

        <AppLoading />
      </>
    );
  }

  return (
    <NavigationContainer>
      {IconHelmet}

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{
            title: "3iD - Landing",
          }}
        />
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{
            title: "3iD - Auth",
          }}
        />
        <Stack.Screen
          name="Gate"
          component={Gate}
          options={{
            title: "3iD - Gate",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
