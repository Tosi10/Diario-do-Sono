import { showAppAlert } from "@/src/components/AppAlert";
import { BrandMark } from "@/src/components/BrandMark";
import {
  Card,
  Eyebrow,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { TextField } from "@/src/components/TextField";
import { demoPersona } from "@/src/content/demoPersona";
import { mapaDoSono } from "@/src/content/mapaDoSono";
import { useAuth } from "@/src/contexts/AuthContext";
import { brandCopy } from "@/src/theme/brand";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const { signIn, enterDemo, user, profile, demoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && profile) return <Redirect href="/" />;

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (e) {
      showAppAlert(
        "Não foi possível entrar",
        e instanceof Error ? e.message : "Erro desconhecido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentMaxWidth={440}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 36,
            paddingBottom: 48,
            flexGrow: 1,
            justifyContent: Platform.OS === "web" ? "center" : "flex-start",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <BrandMark variant="logoVertical" size="lg" />

          <View className="mt-10">
            <Eyebrow>{brandCopy.appName}</Eyebrow>
            <Title>{mapaDoSono.welcomeTitle}</Title>
            <Subtitle>{mapaDoSono.subtitle}</Subtitle>
          </View>

          {demoMode ? (
            <View className="mt-8 gap-3">
              <Card>
                <Text className="font-sansMed text-sm text-sleep-rose mb-1">
                  Apresentação — Dra. Ana Gonçalves
                </Text>
                <Text className="font-sans text-sm text-sleep-muted leading-5">
                  {demoPersona.loginBlurb}
                </Text>
              </Card>
              <PrimaryButton
                label="Entrar como Ana (profissional)"
                onPress={() => {
                  enterDemo("professional");
                  router.replace("/");
                }}
              />
              <SecondaryButton
                label="Entrar como Marina (paciente)"
                onPress={() => {
                  enterDemo("patient");
                  router.replace("/");
                }}
              />
            </View>
          ) : (
            <View className="mt-8">
              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextField
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
              />
              <PrimaryButton
                label={loading ? "Entrando…" : "Entrar"}
                onPress={onSubmit}
                disabled={loading || !email || !password}
              />
              <View className="h-3" />
              <SecondaryButton
                label="Criar conta"
                onPress={() => router.push("/(auth)/register")}
              />
            </View>
          )}

          <Text className="mt-10 text-center font-sans text-xs text-sleep-muted/80">
            {mapaDoSono.welcomeCta}
          </Text>
        </AppScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
