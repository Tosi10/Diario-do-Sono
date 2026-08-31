import { showAppAlert } from "@/src/components/AppAlert";
import { DiaryCycleScreenBody } from "@/src/components/DiaryCycleScreenBody";
import { Screen } from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  formatIsoDatePt,
  toIsoDate,
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
import { ActivityIndicator, View } from "react-native";

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
          <ActivityIndicator color="#AD665C" />
        </View>
      </Screen>
    );
  }

  const canStartNew =
    !weeks.some((w) => w.status === "open") &&
    weeks.some((w) => w.status === "complete" || w.status === "failed");

  const subtitleParts = [
    `${formatIsoDatePt(week.startDate)} — ${formatIsoDatePt(week.endDate)}`,
    `${days.length}/7 dias`,
    week.wakeTime ? `acordar ${week.wakeTime}` : null,
    week.status === "failed"
      ? "ciclo encerrado"
      : week.status === "complete"
        ? "ciclo válido"
        : null,
  ].filter(Boolean);

  return (
    <Screen edges="top">
      <DiaryCycleScreenBody
        mode="patient"
        header={{
          eyebrow: "Grade semanal",
          title: "Diário",
          subtitle: `${subtitleParts.join(" · ")}.`,
        }}
        week={week}
        weeks={weeks}
        days={days}
        todayIso={todayIso}
        canStartNew={canStartNew}
        starting={starting}
        onStartNew={onStartNew}
        onSelectWeek={(w) =>
          router.replace({
            pathname: "/(patient)/week",
            params: { weekId: w.weekId },
          })
        }
        onOpenDay={(date) =>
          router.push({
            pathname: "/(patient)/today",
            params: { date, weekId: week.weekId },
          })
        }
      />
    </Screen>
  );
}
