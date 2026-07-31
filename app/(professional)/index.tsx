import { BrandMark } from "@/src/components/BrandMark";
import {
  Card,
  Eyebrow,
  InfoBanner,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatIsoDatePt, toIsoDate } from "@/src/domain/timeHelpers";
import {
  getProfessionalHomeData,
  type ProfessionalHomeData,
} from "@/src/services/professionalHome";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function ProfessionalHomeScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfessionalHomeData | null>(null);
  const todayIso = toIsoDate(new Date());

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user) return;
        setLoading(true);
        try {
          const home = await getProfessionalHomeData(user.uid);
          if (alive) setData(home);
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
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
      >
        <View className="mb-5 flex-row items-center gap-3">
          <BrandMark size="sm" />
          <View className="flex-1">
            <Eyebrow>{profile?.clinicName || "Consultório"}</Eyebrow>
            <Text className="mt-1 font-displayBold text-2xl text-sleep-ink">
              Olá, {profile?.displayName?.split(" ")[0] || "doutora"}
            </Text>
          </View>
        </View>

        <Title>Início</Title>
        <Subtitle>
          {formatIsoDatePt(todayIso)} · atualizações dos seus pacientes.
        </Subtitle>

        {loading || !data ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#A3B899" />
          </View>
        ) : data.totalPatients === 0 ? (
          <View className="mt-6">
            <InfoBanner>
              Nenhum paciente vinculado ainda. Em Pacientes você vê o código de
              convite.
            </InfoBanner>
          </View>
        ) : (
          <View className="mt-6 gap-2">
            <View className="w-full flex-row gap-2">
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Pacientes
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-rose">
                  {data.totalPatients}
                </Text>
              </Card>
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Hoje ok
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-accent">
                  {data.filledToday}
                </Text>
              </Card>
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Pendentes
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-ink">
                  {data.pendingToday}
                </Text>
              </Card>
            </View>

            <Text className="mt-2 font-sansMed text-xs uppercase tracking-[2px] text-sleep-muted">
              Atualizações recentes
            </Text>

            {data.updates.length === 0 ? (
              <InfoBanner>
                Ainda não há registros novos nesta semana.
              </InfoBanner>
            ) : (
              data.updates.map((u) => (
                <Pressable
                  key={u.patient.patientUid}
                  onPress={() =>
                    router.push(
                      `/(professional)/patient/${u.patient.patientUid}`
                    )
                  }
                >
                  <Card>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <Text className="font-sansBold text-base text-sleep-ink">
                          {u.patient.displayName}
                        </Text>
                        <Text className="mt-1 font-sans text-sm text-sleep-muted leading-5">
                          {u.filledToday
                            ? "Registrou o dia de hoje"
                            : `Último registro: ${formatIsoDatePt(u.lastDay!.date)}`}
                        </Text>
                        <Text className="mt-1 font-sans text-xs text-sleep-lavender">
                          Semana {u.filledDays}/{u.expectedDays} dias
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2.5 py-1 ${
                          u.filledToday
                            ? "bg-sleep-accentSoft"
                            : "bg-sleep-lavenderSoft"
                        }`}
                      >
                        <Text
                          className={`font-sansMed text-[11px] ${
                            u.filledToday
                              ? "text-sleep-accent"
                              : "text-sleep-lavender"
                          }`}
                        >
                          {u.filledToday ? "Hoje" : "Recente"}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
