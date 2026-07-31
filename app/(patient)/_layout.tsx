import { AdaptiveTabBar } from "@/src/components/AdaptiveTabBar";
import {
  WEB_SIDEBAR_WIDTH,
  useIsWebSidebar,
} from "@/src/components/ContentFrame";
import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect, Tabs } from "expo-router";

export default function PatientLayout() {
  const { user, profile, role } = useAuth();
  const isSidebar = useIsWebSidebar();

  if (!user || !profile) return <Redirect href="/(auth)/login" />;
  if (role !== "patient") return <Redirect href="/" />;

  return (
    <Tabs
      tabBar={(props) => <AdaptiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: isSidebar
          ? { marginLeft: WEB_SIDEBAR_WIDTH }
          : undefined,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="week" options={{ title: "Diário" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="today" options={{ href: null }} />
    </Tabs>
  );
}
