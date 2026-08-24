import { showAppAlert } from "@/src/components/AppAlert";
import { CycleHistoryList } from "@/src/components/CycleHistoryList";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  InfoBanner,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { cycleStatusLabel } from "@/src/domain/cycleProtocol";
import {
  formatIsoDatePt,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  getWeek,
  listDaysForWeek,
  listWeeksForPatient,
  startNewCycle,
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
  const { id, weekId: weekIdParam } = useLocalSearchParams<{
    id: string;
    weekId?: string;
  }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [patient, setPatient] = useState<SonoPatient | null>(null);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [weeks, setWeeks] = useState<SonoWeek[]>([]);
  const [days, setDays] = useState<SonoDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!id || !user) return;
        setLoading(true);
        try {
          const p = await getPatient(id);
          const history = await listWeeksForPatient(id);
          let w: SonoWeek | null = null;
          if (typeof weekIdParam === "string" && weekIdParam) {
            w = await getWeek(weekIdParam);
          }
          if (!w) {
            w = await ensureActiveWeek({
              patientUid: id,
              professionalId: user.uid,
            });
          }
          const d = await listDaysForWeek(w.weekId);
          if (!alive) return;
          setPatient(p);
          setWeeks(history);
          setWeek(w);
          setDays(d);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [id, user, weekIdParam])
  );

  const onStartNew = async () => {
    if (!id || !user) return;
    try {
      setStarting(true);
      const w = await startNewCycle({
        patientUid: id,
        professionalId: user.uid,
      });
      router.replace({
        pathname: "/(professional)/patient/[id]",
        params: { id, weekId: w.weekId },
      });
      showAppAlert(
        "Novo ciclo",
        "Ciclo criado. Peça à paciente para definir a hora de acordar no app."
      );
    } catch (e) {
      showAppAlert("Não foi possível", e instanceof Error ? e.message : "Erro");
    } finally {
      setStarting(false);
    }
  };

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
  const todayIso = toIsoDate(new Date());
  const canStartNew =
    !weeks.some((w) => w.status === "open") &&
    weeks.some((w) => w.status === "complete" || w.status === "failed");

  return (
    <Screen edges="top">
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
          Ciclo {formatIsoDatePt(week.startDate)} —{" "}
          {formatIsoDatePt(week.endDate)} · {cycleStatusLabel(week.status)}
          {week.wakeTime ? ` · acordar ${week.wakeTime}` : ""}
        </Subtitle>

        {week.status !== "open" ? (
          <View className="mt-3">
            <InfoBanner>
              Ciclo fechado no histórico. Você ainda pode abrir qualquer dia
              para corrigir.
            </InfoBanner>
          </View>
        ) : null}

        {canStartNew ? (
          <View className="mt-3">
            <PrimaryButton
              label={starting ? "Criando…" : "Iniciar novo ciclo"}
              onPress={onStartNew}
              disabled={starting}
            />
          </View>
        ) : null}

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
                        : "Toque para preencher ou ler a folha"}
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

        <Card className="mt-4">
          <Text className="font-sansMed text-sleep-ink mb-1">
            Histórico de ciclos
          </Text>
          <Text className="mb-2 font-sans text-xs text-sleep-muted">
            Inclui ciclos válidos e incompletos — estudo completo da paciente.
          </Text>
          <CycleHistoryList
            weeks={weeks}
            selectedWeekId={week.weekId}
            onSelect={(w) =>
              router.push({
                pathname: "/(professional)/patient/[id]",
                params: { id, weekId: w.weekId },
              })
            }
          />
        </Card>
      </AppScrollView>
    </Screen>
  );
}
