import { showAppAlert } from "@/src/components/AppAlert";
import { CycleHistoryList } from "@/src/components/CycleHistoryList";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  Eyebrow,
  InfoBanner,
  PrimaryButton,
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
  getWeek,
  listDaysForWeek,
  listWeeksForPatient,
  startNewCycle,
} from "@/src/services/diary";
import type { SonoDay, SonoWeek } from "@/src/types";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PatientDiaryScreen() {
  const { weekId: weekIdParam } = useLocalSearchParams<{ weekId?: string }>();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [weeks, setWeeks] = useState<SonoWeek[]>([]);
  const [days, setDays] = useState<SonoDay[]>([]);
  const todayIso = toIsoDate(new Date());

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const history = await listWeeksForPatient(user.uid);
      setWeeks(history);

      let w: SonoWeek | null = null;
      if (typeof weekIdParam === "string" && weekIdParam) {
        w = await getWeek(weekIdParam);
      }
      if (!w) {
        w = await ensureActiveWeek({
          patientUid: user.uid,
          professionalId: profile.linkedProfessionalId ?? null,
        });
      }
      const d = await listDaysForWeek(w.weekId);
      setWeek(w);
      setDays(d);
    } catch (e) {
      showAppAlert("Erro", e instanceof Error ? e.message : "Falha");
    } finally {
      setLoading(false);
    }
  }, [user, profile, weekIdParam]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onStartNew = async () => {
    if (!user || !profile) return;
    try {
      setStarting(true);
      const w = await startNewCycle({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      router.replace({
        pathname: "/(patient)/week",
        params: { weekId: w.weekId },
      });
      showAppAlert(
        "Novo ciclo",
        "Ciclo criado. No Início, defina a hora de acordar desta semana."
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
  const isHistorical = week.status !== "open";
  const canStartNew =
    !weeks.some((w) => w.status === "open") &&
    weeks.some((w) => w.status === "complete" || w.status === "failed");

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
          {days.length}/7 dias
          {week.wakeTime ? ` · acordar ${week.wakeTime}` : ""}
          {week.status === "failed"
            ? " · ciclo encerrado"
            : week.status === "complete"
              ? " · ciclo válido"
              : ""}
          .
        </Subtitle>

        {isHistorical ? (
          <View className="mt-3">
            <InfoBanner>
              Você está vendo um ciclo anterior (somente leitura). A
              profissional pode corrigir se for necessário.
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
                          isToday ? "" : " · ver"
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
                      {isToday && week.status === "open" ? "Abrir" : "Ver"}
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

        <Card className="mt-4">
          <Text className="font-sansMed text-sleep-ink mb-1">
            Histórico de ciclos
          </Text>
          <Text className="mb-2 font-sans text-xs text-sleep-muted">
            Completos e incompletos ficam salvos para o acompanhamento.
          </Text>
          <CycleHistoryList
            weeks={weeks}
            selectedWeekId={week.weekId}
            onSelect={(w) =>
              router.push({
                pathname: "/(patient)/week",
                params: { weekId: w.weekId },
              })
            }
          />
        </Card>
      </AppScrollView>
    </Screen>
  );
}
