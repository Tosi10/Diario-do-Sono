import {
  Card,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

export default function ProfessionalProfile() {
  const { profile, signOut, demoMode } = useAuth();

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Title>Perfil</Title>
        <Subtitle>{profile?.displayName}</Subtitle>

        <Card className="mt-5">
          <Text className="font-sans text-sm text-sleep-muted">Papel</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            Administradora / profissional
          </Text>
          {demoMode ? (
            <>
              <Text className="font-sans text-sm text-sleep-muted mt-4">
                Modo
              </Text>
              <Text className="font-sansMed text-sleep-accent mt-1">
                Demo (sem banco)
              </Text>
            </>
          ) : null}
          <Text className="font-sans text-sm text-sleep-muted mt-4">E-mail</Text>
          <Text className="font-sansMed text-sleep-ink mt-1">
            {profile?.email}
          </Text>
          <Text className="font-sans text-sm text-sleep-muted mt-4">
            Código de pacientes
          </Text>
          <Text className="font-displayBold text-2xl text-sleep-ink mt-1 tracking-widest">
            {profile?.inviteCode}
          </Text>
        </Card>

        <View className="mt-6">
          <SecondaryButton label="Sair" onPress={() => void signOut()} />
        </View>
      </AppScrollView>
    </Screen>
  );
}
