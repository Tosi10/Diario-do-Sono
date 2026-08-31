import { showAppAlert } from "@/src/components/AppAlert";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import { TextField } from "@/src/components/TextField";
import {
  Card,
  InfoBanner,
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { demoPersona } from "@/src/content/demoPersona";
import { useAuth } from "@/src/contexts/AuthContext";
import { linkPatientToProfessionalByCode } from "@/src/services/users";
import { useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

export default function PatientProfileScreen() {
  const { user, profile, signOut, refreshProfile, demoMode } = useAuth();
  const [code, setCode] = useState(
    demoMode ? demoPersona.professional.inviteCode : ""
  );
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
      showAppAlert("Vinculado", "Você está conectada à Dra. Ana Gonçalves.");
      setCode("");
    } catch (e) {
      showAppAlert("Código", e instanceof Error ? e.message : "Falha");
    } finally {
      setLinking(false);
    }
  };

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader title="Perfil" subtitle={profile?.displayName} />

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
            <InfoBanner>
              Vinculada à Dra. Ana Gonçalves ({demoPersona.professional.clinicName}
              ). Qualquer dúvida, fale com ela na consulta.
            </InfoBanner>
          ) : (
            <>
              <EmptyState
                compact
                image={emptyStateImages.ginkgo}
                title="Código da consulta"
                message={`Digite o código que a Dra. Ana passou. Na demonstração use ${demoPersona.professional.inviteCode}.`}
              />
              <TextField
                label="Código dela"
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                placeholder={demoPersona.professional.inviteCode}
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
