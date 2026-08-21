import {
  Card,
  InfoBanner,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { demoPersona } from "@/src/content/demoPersona";
import { useAuth } from "@/src/contexts/AuthContext";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

export default function ProfessionalProfile() {
  const { profile, signOut, demoMode } = useAuth();

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Title>Perfil</Title>
        <Subtitle>{profile?.displayName}</Subtitle>

        <Card className="mt-5">
          <Text className="font-sans text-sm text-sleep-muted">Papel</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            Psiquiatra · Sono à Vista
          </Text>
          {profile?.clinicName ? (
            <>
              <Text className="font-sans text-sm text-sleep-muted mt-4">
                Clínica
              </Text>
              <Text className="font-sansMed text-sleep-ink mt-1">
                {profile.clinicName}
              </Text>
            </>
          ) : null}
          {demoMode ? (
            <View className="mt-4">
              <InfoBanner>
                Protótipo de apresentação — dados de exemplo, sem banco ainda.
              </InfoBanner>
            </View>
          ) : null}
          <Text className="font-sans text-sm text-sleep-muted mt-4">E-mail</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            {profile?.email}
          </Text>
          <Text className="font-sans text-sm text-sleep-muted mt-4">
            Código para pacientes
          </Text>
          <Text className="font-displayBold text-2xl text-sleep-ink mt-1 tracking-widest">
            {profile?.inviteCode ?? demoPersona.professional.inviteCode}
          </Text>
          <Text className="mt-2 font-sans text-xs text-sleep-muted leading-5">
            Na consulta, a paciente digita este código em Perfil para se
            vincular a você.
          </Text>
        </Card>

        <View className="mt-6">
          <SecondaryButton label="Sair" onPress={() => void signOut()} />
        </View>
      </AppScrollView>
    </Screen>
  );
}
