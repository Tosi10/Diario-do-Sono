import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import {
  Card,
  PageHeader,
  Screen,
  screenScrollContent,
} from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { useAuth } from "@/src/contexts/AuthContext";
import { listPatientsForProfessional } from "@/src/services/patients";
import type { SonoPatient } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function ProfessionalPatientsScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<SonoPatient[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user) return;
        setLoading(true);
        try {
          const list = await listPatientsForProfessional(user.uid);
          if (alive) setPatients(list);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [user])
  );

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader
          eyebrow={profile?.clinicName || "Clínica Cuidar"}
          title="Pacientes"
          subtitle="Toque para abrir o diário. Elena Prado já tem quase o ciclo completo — bom para mostrar métricas."
        />

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
          </View>
        ) : patients.length === 0 ? (
          <Card className="mt-6">
            <EmptyState
              image={emptyStateImages.rest}
              title="Aguardando pacientes"
              message="Peça para criarem conta no app e digitarem o código do seu Perfil para se vincular."
            />
          </Card>
        ) : (
          <View className="mt-5 gap-3">
            {patients.map((p) => (
              <Pressable
                key={p.patientUid}
                onPress={() =>
                  router.push(`/(professional)/patient/${p.patientUid}`)
                }
              >
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="font-sansBold text-lg text-sleep-ink">
                        {p.displayName}
                      </Text>
                      <Text className="font-sans text-sm text-sleep-muted mt-1">
                        {p.email}
                      </Text>
                    </View>
                    <View className="rounded-full bg-sleep-accentSoft px-3 py-1.5">
                      <Text className="font-sansMed text-xs text-sleep-accent">
                        {p.filledDays}/{p.expectedDays || 7}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
