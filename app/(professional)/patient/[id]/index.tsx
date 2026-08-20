import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  formatIsoDatePt,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
} from "@/src/services/diary";
import { getPatient } from "@/src/services/patients";
import type { SonoDay, SonoPatient, SonoWeek } from "@/src/types";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<SonoPatient | null>(null);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [days, setDays] = useState<SonoDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!id || !user) return;
        setLoading(true);
        try {
          const p = await getPatient(id);
          const w = await ensureActiveWeek({
            patientUid: id,
            professionalId: user.uid,
          });
          const d = await listDaysForWeek(w.weekId);
          if (!alive) return;
          setPatient(p);
          setWeek(w);
          setDays(d);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [id, user])
  );

  if (loading || !week) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#AC665C" />
        </View>
      </Screen>
    );
  }

  const dates = weekDateList(week.startDate);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const todayIso = toIsoDate(new Date());

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
      >
        <Pressable onPress={() => router.back()}>
          <Text className="font-sansMed text-sm text-sleep-accent mb-2">
            ← Voltar
          </Text>
        </Pressable>
        <Title>{patient?.displayName || "Paciente"}</Title>
        <Subtitle>
          Diário {formatIsoDatePt(week.startDate)} —{" "}
          {formatIsoDatePt(week.endDate)}
        </Subtitle>

        <View className="mt-4">
          <SecondaryButton
            label="Ler folha em papel (foto)"
            onPress={() =>
              router.push({
                pathname: "/(professional)/ocr",
                params: { patientId: id },
              })
            }
          />
        </View>

        <Card className="mt-5">
          {dates.map((date, i) => {
            const day = byDate.get(date);
            return (
              <Pressable
                key={date}
                onPress={() =>
                  router.push({
                    pathname: "/(professional)/patient/[id]/day",
                    params: { id, date },
                  })
                }
                className={`py-3 ${
                  i < dates.length - 1 ? "border-b border-sleep-line" : ""
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="font-sansMed text-sleep-ink">
                      Dia {i + 1} · {formatIsoDatePt(date)}
                      {date === todayIso ? " (hoje)" : ""}
                    </Text>
                    <Text className="font-sans text-xs text-sleep-muted mt-0.5">
                      {day
                        ? `${day.entrySource === "professional" ? "Você registrou" : "Paciente registrou"} · EF ${day.metrics.efPatient}%`
                        : "Toque para preencher"}
                    </Text>
                  </View>
                  <Text className="font-sansMed text-sleep-accent">Abrir</Text>
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
