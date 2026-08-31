import { showAppAlert } from "@/src/components/AppAlert";
import { DiaryCycleScreenBody } from "@/src/components/DiaryCycleScreenBody";
import { Screen } from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { cycleStatusLabel } from "@/src/domain/cycleProtocol";
import { formatIsoDatePt, toIsoDate } from "@/src/domain/timeHelpers";
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
import { ActivityIndicator, View } from "react-native";

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
  const todayIso = toIsoDate(new Date());

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
          <ActivityIndicator color="#AD665C" />
        </View>
      </Screen>
    );
  }

  const canStartNew =
    !weeks.some((w) => w.status === "open") &&
    weeks.some((w) => w.status === "complete" || w.status === "failed");

  const subtitleParts = [
    `Ciclo ${formatIsoDatePt(week.startDate)} — ${formatIsoDatePt(week.endDate)}`,
    cycleStatusLabel(week.status),
    week.wakeTime ? `acordar ${week.wakeTime}` : null,
  ].filter(Boolean);

  return (
    <Screen edges="top">
      <DiaryCycleScreenBody
        mode="professional"
        header={{
          eyebrow: "Diário do sono",
          title: patient?.displayName || "Paciente",
          subtitle: subtitleParts.join(" · "),
          onBack: () => router.push("/(professional)/patients"),
          backLabel: "Pacientes",
        }}
        week={week}
        weeks={weeks}
        days={days}
        todayIso={todayIso}
        canStartNew={canStartNew}
        starting={starting}
        onStartNew={onStartNew}
        historyHint="Inclui ciclos válidos e incompletos — estudo completo da paciente."
        onSelectWeek={(w) =>
          router.replace({
            pathname: "/(professional)/patient/[id]",
            params: { id, weekId: w.weekId },
          })
        }
        onOpenDay={(date) =>
          router.push({
            pathname: "/(professional)/patient/[id]/day",
            params: { id, date, weekId: week.weekId },
          })
        }
      />
    </Screen>
  );
}
