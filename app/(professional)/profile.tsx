import { showAppAlert } from "@/src/components/AppAlert";
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
  const { profile, signOut, demoMode, user, sendVerificationEmail } = useAuth();
  const emailVerified =
    !!user && "emailVerified" in user && user.emailVerified === true;

  const onResend = async () => {
    try {
      await sendVerificationEmail();
      showAppAlert(
        "E-mail enviado",
        "Abra a caixa admin@vision10.com.br e confirme o link."
      );
    } catch (e) {
      showAppAlert(
        "Não enviou",
        e instanceof Error ? e.message : "Tente de novo em alguns minutos."
      );
    }
  };

  return (
    <Screen edges="top" atmosphere="soft">
      <AppScrollView
        className="flex-1"
        contentContainerStyle={[screenScrollContent, { paddingHorizontal: 20 }]}
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
          {!demoMode && !emailVerified ? (
            <View className="mt-4 gap-3">
              <InfoBanner>
                Confirme este e-mail. Enquanto testamos, os avisos da clínica
                também chegam em admin@vision10.com.br.
              </InfoBanner>
              <SecondaryButton
                label="Reenviar confirmação"
                onPress={() => void onResend()}
              />
            </View>
          ) : null}
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
