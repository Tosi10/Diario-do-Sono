import "../global.css";
import { AppAlertHost } from "@/src/components/AppAlert";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { brand } from "@/src/theme/brand";
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
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
    BethanyElingston: require("../assets/fonts/BethanyElingston.ttf"),
    "BethanyElingston-Italic": require("../assets/fonts/BethanyElingston-Italic.ttf"),
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== "web") {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && Platform.OS !== "web") {
    return <View style={{ flex: 1, backgroundColor: brand.marfim }} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: brand.marfim },
          animation: "fade",
        }}
      />
      <AppAlertHost />
    </AuthProvider>
  );
}
