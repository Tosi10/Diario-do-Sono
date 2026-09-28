import { EmptyState } from "@/src/components/EmptyState";
import {
  Card,
  InfoBanner,
  PageHeader,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { demoPersona } from "@/src/content/demoPersona";
import { useAuth } from "@/src/contexts/AuthContext";
import type { LinkStatus } from "@/src/types";
import { AppScrollView } from "@/src/components/AppScrollView";
import { Text, View } from "react-native";

function resolveLinkStatus(
  profile: { linkStatus?: LinkStatus; linkedProfessionalId?: string | null }
): LinkStatus {
  if (profile.linkStatus) return profile.linkStatus;
  return profile.linkedProfessionalId ? "active" : "none";
}

export default function PatientProfileScreen() {
  const { profile, signOut } = useAuth();
  const status = profile ? resolveLinkStatus(profile) : "none";

  return (
    <Screen edges="top" atmosphere="soft">
      <AppScrollView
        className="flex-1"
        contentContainerStyle={[screenScrollContent, { paddingHorizontal: 20 }]}
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
          {status === "active" ? (
            <InfoBanner>
              Vinculada à Dra. Ana Gonçalves ({demoPersona.professional.clinicName}
              ). Qualquer dúvida, fale com ela na consulta.
            </InfoBanner>
          ) : status === "pending" ? (
            <EmptyState
              compact
              title="Aguardando a Dra. Ana"
              message="Seu cadastro já chegou até ela. Assim que aprovar, o diário será liberado."
            />
          ) : status === "blocked" ? (
            <EmptyState
              compact
              title="Acesso pausado"
              message="A Dra. Ana bloqueou temporariamente o uso do diário. Fale com ela na consulta."
            />
          ) : (
            <EmptyState
              compact
              title="Sem vínculo ativo"
              message="Ao criar a conta, o pedido vai automaticamente para a Dra. Ana. Se foi recusado, fale com ela."
            />
          )}
        </Card>

        <View className="mt-6">
          <SecondaryButton label="Sair" onPress={() => void signOut()} />
        </View>
      </AppScrollView>
    </Screen>
  );
}
