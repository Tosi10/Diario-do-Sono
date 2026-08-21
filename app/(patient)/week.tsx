import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  Eyebrow,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  formatIsoDatePt,
  formatMinutesAsHm,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
} from "@/src/services/diary";
import type { SonoDay, SonoWeek } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PatientDiaryScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [days, setDays] = useState<SonoDay[]>([]);
  const todayIso = toIsoDate(new Date());

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const w = await ensureActiveWeek({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      const d = await listDaysForWeek(w.weekId);
      setWeek(w);
      setDays(d);
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha");
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading || !week) {
    return (
      <Screen edges="top">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#AC665C" />
        </View>
      </Screen>
    );
  }

  const dates = weekDateList(week.startDate);
  const byDate = new Map(days.map((d) => [d.date, d]));

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Eyebrow>Grade semanal</Eyebrow>
        <Title>Diário</Title>
        <Subtitle>
          {formatIsoDatePt(week.startDate)} — {formatIsoDatePt(week.endDate)} ·{" "}
          {days.length}/7 dias. Hoje você preenche; dias anteriores só consulta.
        </Subtitle>

        <Card className="mt-5">
          {dates.map((date, i) => {
            const day = byDate.get(date);
            const isToday = date === todayIso;
            const isFuture = date > todayIso;
            const canOpen = !isFuture;

            return (
              <Pressable
                key={date}
                disabled={!canOpen}
                onPress={() => {
                  if (!canOpen) return;
                  router.push({
                    pathname: "/(patient)/today",
                    params: { date },
                  });
                }}
                className={`flex-row items-center justify-between py-3 ${
                  i < dates.length - 1 ? "border-b border-sleep-line" : ""
                } ${isFuture ? "opacity-45" : ""}`}
              >
                <View className="flex-1 pr-2">
                  <Text className="font-sansMed text-sleep-ink">
                    Dia {i + 1} · {formatIsoDatePt(date)}
                    {isToday ? " (hoje)" : ""}
                  </Text>
                  <Text className="font-sans text-xs text-sleep-muted mt-0.5">
                    {day
                      ? `Sono ~ ${formatMinutesAsHm(day.metrics.ttsPatient)} · EF ${day.metrics.efPatient}%${
                          isToday ? "" : " · ver histórico"
                        }`
                      : isToday
                        ? "Toque para preencher"
                        : isFuture
                          ? "Ainda não chegou"
                          : "Sem registro · toque para ver"}
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <View
                    className={`h-2.5 w-2.5 rounded-full ${
                      day ? "bg-sleep-accent" : "bg-sleep-line"
                    }`}
                  />
                  {canOpen ? (
                    <Text className="font-sansMed text-xs text-sleep-accent">
                      {isToday ? "Abrir" : day ? "Ver" : "Ver"}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </Card>

        {week.averages ? (
          <Card className="mt-4">
            <Text className="font-sansMed text-sleep-ink mb-1">
              Resumo clínico (médias)
            </Text>
            <MetricsPanel averages={week.averages} />
          </Card>
        ) : null}
      </AppScrollView>
    </Screen>
  );
}
