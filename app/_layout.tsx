import "../global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { brand } from "@/src/theme/brand";
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== "web") {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && Platform.OS !== "web") {
    return <View style={{ flex: 1, backgroundColor: brand.indigo }} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: brand.indigo },
          animation: "fade",
        }}
      />
    </AuthProvider>
  );
}
