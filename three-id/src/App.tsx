import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
import { useEffect } from "react";
import { startSession, stopSession } from "./analytics/datadog";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    stopSession()

    const asyncFn = async () => {
      await startSession() 
    }

    asyncFn()

    return () => {
      stopSession()
    }
  }, [])

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="Gate" component={Gate} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
