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

import { Manrope_500Medium, Manrope_700Bold } from "@expo-google-fonts/manrope";

import { startSession, stopSession } from "./analytics/datadog";

// TODO: Handle these screen better
import Landing from "./screens/funnel/Landing";
import Auth from "./screens/funnel/Auth";
import Gate from "./screens/funnel/Gate";
import Mint from "./screens/minting/Mint";
import Settings from "./screens/profile/Settings";
import Details from "./screens/profile/Details";
import Invite from "./screens/funnel/Invite";
import Naming from "./screens/profile/Naming";
import Onboard from "./screens/onboarding/Onboard";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./state/store";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Manrope_500Medium,
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
    <Provider store={store}>
      <NavigationContainer
        linking={{
          prefixes: [],
          config: {
            screens: {
              Landing: "/",
              Auth: "/authentication",
              Gate: "/gate",
              Invite: "/invitation",
              Mint: "/mint",
              Details: "/profile",
              Settings: "/profile/settings",
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
            <Stack.Screen name="Mint" component={Mint} />
            <Stack.Screen name="Onboard" component={Onboard} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Details" component={Details} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
