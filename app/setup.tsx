import {
  Card,
  InfoBanner,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect, router } from "expo-router";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

/** Mantida por compatibilidade; login demo é a entrada principal. */
export default function SetupScreen() {
  const { demoMode, user, profile } = useAuth();

  if (user && profile) return <Redirect href="/" />;
  if (demoMode) return <Redirect href="/(auth)/login" />;

  return (
    <Screen>
      <AppScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>Sono à Vista</Title>
        <Subtitle>
          Firebase ainda não está ligado. Use o modo demo ou configure o `.env`
          depois.
        </Subtitle>

        <View className="mt-6 gap-3">
          <PrimaryButton
            label="Abrir modo demo"
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>

        <Card className="mt-6">
          <Text className="font-sansMed text-sleep-ink mb-2">
            Quando for ligar o banco
          </Text>
          {[
            "EXPO_PUBLIC_FIREBASE_API_KEY",
            "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
            "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
            "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
            "EXPO_PUBLIC_FIREBASE_APP_ID",
          ].map((k) => (
            <Text key={k} className="font-sans text-xs text-sleep-muted mb-1">
              {k}
            </Text>
          ))}
        </Card>

        <View className="h-4" />
        <InfoBanner>
          Não criamos projeto Firebase ainda — primeiro validamos o app no demo.
        </InfoBanner>
      </AppScrollView>
    </Screen>
  );
}
