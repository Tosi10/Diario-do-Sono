import { AdaptiveTabBar } from "@/src/components/AdaptiveTabBar";
import {
  WEB_SIDEBAR_WIDTH,
  useIsWebSidebar,
} from "@/src/components/ContentFrame";
import { useAuth } from "@/src/contexts/AuthContext";
import { ensureClinicAnchor } from "@/src/services/patients";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";

export default function ProfessionalLayout() {
  const { user, profile, role } = useAuth();
  const isSidebar = useIsWebSidebar();

  useEffect(() => {
    if (!user || (role !== "professional" && role !== "admin")) return;
    void ensureClinicAnchor(user.uid).catch(() => undefined);
  }, [user, role]);

  if (!user || !profile) return <Redirect href="/(auth)/login" />;
  if (role !== "professional" && role !== "admin") {
    return <Redirect href="/" />;
  }

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
      <Tabs.Screen name="patients" options={{ title: "Pacientes" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="ocr" options={{ href: null }} />
      <Tabs.Screen name="patient/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="patient/[id]/day" options={{ href: null }} />
      <Tabs.Screen name="ocr-review" options={{ href: null }} />
    </Tabs>
  );
}
