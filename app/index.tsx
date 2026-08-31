import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { ready, user, profile, role } = useAuth();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-sleep-bg">
        <ActivityIndicator color="#AD665C" />
      </View>
    );
  }

  if (!user || !profile) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === "professional" || role === "admin") {
    return <Redirect href="/(professional)" />;
  }

  if (role === "patient") {
    return <Redirect href="/(patient)" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-sleep-bg px-6">
      <Text className="font-sans text-sleep-muted text-center">
        Perfil sem papel definido. Faça logout e entre de novo.
      </Text>
    </View>
  );
}
