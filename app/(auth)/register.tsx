import { showAppAlert } from "@/src/components/AppAlert";
import { TextField } from "@/src/components/TextField";
import {
  InfoBanner,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import type { SonoRole } from "@/src/types";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { signUp, user, profile, configured } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [role, setRole] = useState<SonoRole>("patient");
  const [loading, setLoading] = useState(false);

  if (!configured) return <Redirect href="/setup" />;
  if (user && profile) return <Redirect href="/" />;

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signUp({
        email,
        password,
        displayName,
        role,
        clinicName: role === "professional" ? clinicName : undefined,
      });
      router.replace("/");
    } catch (e) {
      showAppAlert(
        "Cadastro",
        e instanceof Error ? e.message : "Erro desconhecido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <Title>Criar conta</Title>
          <Subtitle>Escolha se você é paciente ou a profissional.</Subtitle>

          <View className="mt-5 flex-row gap-2">
            <RoleChip
              label="Paciente"
              active={role === "patient"}
              onPress={() => setRole("patient")}
            />
            <RoleChip
              label="Profissional"
              active={role === "professional"}
              onPress={() => setRole("professional")}
            />
          </View>

          <View className="mt-6">
            <TextField
              label="Nome"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Seu nome"
            />
            {role === "professional" ? (
              <TextField
                label="Clínica / consultório"
                value={clinicName}
                onChangeText={setClinicName}
                placeholder="Opcional"
              />
            ) : null}
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu@email.com"
            />
            <TextField
              label="Senha (mín. 6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
            />

            {role === "patient" ? (
              <InfoBanner>
                Depois do cadastro, seu pedido vai automaticamente para a Dra.
                Ana. O diário libera quando ela aprovar.
              </InfoBanner>
            ) : (
              <InfoBanner>
                Como profissional, você aprova, bloqueia e remove pacientes em
                Pacientes — o app é da sua clínica.
              </InfoBanner>
            )}

            <View className="h-4" />
            <PrimaryButton
              label={loading ? "Criando…" : "Criar conta"}
              onPress={onSubmit}
              disabled={loading || !email || !password || !displayName}
            />
            <Pressable className="mt-4" onPress={() => router.back()}>
              <Text className="text-center font-sansMed text-sleep-accent">
                Já tenho conta
              </Text>
            </Pressable>
          </View>
        </AppScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function RoleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl border px-3 py-3 ${
        active
          ? "border-sleep-accent bg-sleep-accent"
          : "border-sleep-line bg-sleep-bgDeep/70"
      }`}
    >
      <Text
        className={`text-center font-sansMed ${
          active ? "text-sleep-bg" : "text-sleep-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
