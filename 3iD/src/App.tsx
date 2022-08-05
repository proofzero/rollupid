import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import { Manrope_700Bold } from "@expo-google-fonts/manrope";

import { useEffect } from "react";
import { startSession, stopSession } from "./analytics/datadog";

// TODO: Handle these screen better
import Landing from "./screens/funnel/Landing";
import Auth from "./screens/funnel/Auth";
import Gate from "./screens/funnel/Gate";
import Mint from "./screens/minting/Mint";
import Settings from "./screens/profile/Settings";
import Invite from "./screens/funnel/Invite";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    stopSession();

    const asyncFn = async () => {
      await startSession();
    };

    asyncFn();

    return () => {
      stopSession();
    };
  }, []);

  if (!fontsLoaded) return null;

  /**
   * Prefixes should contain the urls
   * perhaps they can be added through
   * constants module.
   *
   * For now empty *seems* to work
   */
  return (
    <NavigationContainer
      linking={{
        prefixes: [],
        config: {
          screens: {
            Landing: "",
            Auth: "authentication",
            Gate: "gate",
            Settings: "settings",
            Mint: "mint",
            Invite: "invitation",
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Group>
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="Auth" component={Auth} />
          <Stack.Screen name="Gate" component={Gate} />
          <Stack.Screen name="Invite" component={Invite} />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="Mint" component={Mint} />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
