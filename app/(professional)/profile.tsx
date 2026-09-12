import {
  Card,
  InfoBanner,
  PageHeader,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

export default function ProfessionalProfile() {
  const { profile, signOut, demoMode } = useAuth();

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader title="Perfil" subtitle={profile?.displayName} />

        <Card className="mt-5">
          <Text className="font-sans text-sm text-sleep-muted">Papel</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            Psiquiatra · Sono à Vista · admin da clínica
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
                Em Pacientes você aprova, bloqueia ou remove quem usa o app.
              </InfoBanner>
            </View>
          ) : null}
          <Text className="font-sans text-sm text-sleep-muted mt-4">E-mail</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            {profile?.email}
          </Text>
          <Text className="mt-4 font-sans text-xs text-sleep-muted leading-5">
            Quem se cadastra no app entra automaticamente na sua fila de
            Pendentes. Não é necessário código de vínculo.
          </Text>
        </Card>

        <View className="mt-6">
          <SecondaryButton label="Sair" onPress={() => void signOut()} />
        </View>
      </AppScrollView>
    </Screen>
  );
}
