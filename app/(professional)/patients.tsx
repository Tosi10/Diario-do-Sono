import {
  Card,
  Eyebrow,
  InfoBanner,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
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
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Eyebrow>{profile?.clinicName || "Clínica Cuidar"}</Eyebrow>
        <Title>Pacientes</Title>
        <Subtitle>
          Toque para abrir a semana. Elena Prado já tem quase o ciclo completo —
          bom para mostrar métricas.
        </Subtitle>

        <Card className="mt-5">
          <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
            Código de vínculo
          </Text>
          <Text className="mt-2 font-displayBold text-3xl text-sleep-rose tracking-[6px]">
            {profile?.inviteCode || "MAPA01"}
          </Text>
          <Text className="mt-2 font-sans text-xs text-sleep-muted leading-5">
            Na consulta, a paciente digita este código no Perfil dela.
          </Text>
        </Card>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#AC665C" />
          </View>
        ) : patients.length === 0 ? (
          <View className="mt-6">
            <InfoBanner>
              Ainda não há pacientes vinculados. Peça para eles criarem conta e
              digitarem o seu código.
            </InfoBanner>
          </View>
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
