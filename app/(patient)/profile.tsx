import { TextField } from "@/src/components/TextField";
import {
  Card,
  InfoBanner,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { linkPatientToProfessionalByCode } from "@/src/services/users";
import { useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Alert, Text, View } from "react-native";

export default function PatientProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [linking, setLinking] = useState(false);

  const onLink = async () => {
    if (!user || !profile) return;
    try {
      setLinking(true);
      await linkPatientToProfessionalByCode({
        patientUid: user.uid,
        patientName: profile.displayName,
        patientEmail: profile.email,
        inviteCode: code,
      });
      await refreshProfile();
      Alert.alert("Vinculado", "Você está conectado à profissional.");
      setCode("");
    } catch (e) {
      Alert.alert("Código", e instanceof Error ? e.message : "Falha");
    } finally {
      setLinking(false);
    }
  };

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Title>Perfil</Title>
        <Subtitle>{profile?.displayName}</Subtitle>

        <Card className="mt-5">
          <Text className="font-sans text-sm text-sleep-muted">E-mail</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            {profile?.email}
          </Text>
        </Card>

        <Card className="mt-4">
          <Text className="font-sansMed text-sleep-ink mb-2">
            Vínculo com a profissional
          </Text>
          {profile?.linkedProfessionalId ? (
            <InfoBanner>Já vinculado. Qualquer dúvida, fale com ela.</InfoBanner>
          ) : (
            <>
              <TextField
                label="Código dela"
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                placeholder="ABC123"
                autoCapitalize="none"
              />
              <PrimaryButton
                label={linking ? "Vinculando…" : "Vincular"}
                onPress={onLink}
                disabled={linking || code.length < 4}
              />
            </>
          )}
        </Card>

        <View className="mt-6">
          <SecondaryButton label="Sair" onPress={() => void signOut()} />
        </View>
      </AppScrollView>
    </Screen>
  );
}
