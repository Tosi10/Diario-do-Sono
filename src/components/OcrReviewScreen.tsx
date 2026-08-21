import { DayForm } from "@/src/components/DayForm";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  DangerBanner,
  InfoBanner,
  PrimaryButton,
  Screen,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { computeDayMetrics } from "@/src/domain/sleepMetrics";
import { canSaveDay, formatIsoDatePt } from "@/src/domain/timeHelpers";
import { saveDayEntry } from "@/src/services/diary";
import { getOcrJob, updateOcrJob } from "@/src/services/ocr";
import type { SleepDayInput } from "@/src/types";
import type { OcrJob } from "@/src/types/ocr";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

export function OcrReviewScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user, profile, role } = useAuth();
  const initial = jobId ? getOcrJob(jobId) : null;
  const [job, setJob] = useState<OcrJob | null>(initial);
  const [dayIndex, setDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const draft = job?.draftDays[dayIndex];
  const form: SleepDayInput | null = draft
    ? {
        date: draft.date,
        q0: draft.q0,
        q1: draft.q1,
        q2: draft.q2,
        q3: draft.q3,
        q4: draft.q4,
        q5: draft.q5,
        q6: draft.q6,
        q7: draft.q7,
        q8: draft.q8,
        q9: draft.q9,
        q10: draft.q10,
        qualityFeel: draft.qualityFeel,
        qualityEnjoy: draft.qualityEnjoy,
      }
    : null;

  const gate = useMemo(() => {
    if (!form || !role) return { ok: false as const, reason: "Sem dados" };
    return canSaveDay(form.date, new Date(), {
      allowPastByProfessional:
        role === "professional" || role === "admin",
    });
  }, [form, role]);

  if (!job || !form || !draft) {
    return (
      <Screen edges="top">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-sans text-sleep-muted text-center">
            Leitura não encontrada.
          </Text>
          <Pressable className="mt-4" onPress={() => router.back()}>
            <Text className="font-sansMed text-sleep-accent">Voltar</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const onChangeForm = (next: SleepDayInput) => {
    const days = [...job.draftDays];
    days[dayIndex] = { ...days[dayIndex]!, ...next };
    const updated = updateOcrJob(job.jobId, { draftDays: days });
    setJob(updated);
  };

  const onConfirm = async () => {
    if (!user || !role || !form || !profile) return;
    if (!gate.ok) {
      Alert.alert("Bloqueado", gate.reason);
      return;
    }
    try {
      setSaving(true);
      const professionalId =
        role === "patient"
          ? profile.linkedProfessionalId ?? null
          : user.uid;
      await saveDayEntry({
        patientUid: job.patientUid,
        professionalId,
        actorUid: user.uid,
        actorRole: role,
        input: form,
        entrySource: "ocr",
      });
      const updated = updateOcrJob(job.jobId, { status: "confirmed" });
      setJob(updated);
      Alert.alert("Confirmado", "Dados da folha gravados no diário.", [
        {
          text: "OK",
          onPress: () => {
            if (role === "professional" || role === "admin") {
              router.replace({
                pathname: "/(professional)/patient/[id]/day",
                params: { id: job.patientUid, date: form.date },
              });
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert(
        "Não gravou",
        e instanceof Error ? e.message : "Erro desconhecido"
      );
    } finally {
      setSaving(false);
    }
  };

  const metrics = computeDayMetrics(form);

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text className="font-sansMed text-sleep-accent mb-2">← Voltar</Text>
        </Pressable>
        <Title>Revisar leitura</Title>
        <Text className="mt-1 font-sans text-sleep-muted">
          {job.patientName} · {formatIsoDatePt(form.date)}
        </Text>

        <Image
          source={{ uri: job.imageUri }}
          className="mt-4 h-44 w-full rounded-xl"
          resizeMode="cover"
        />

        <View className="mt-4 gap-2">
          {job.warnings.map((w) => (
            <InfoBanner key={w}>{w}</InfoBanner>
          ))}
          {draft.confidence < 0.7 ? (
            <DangerBanner>
              Confiança baixa neste dia — confira com cuidado.
            </DangerBanner>
          ) : null}
          {!gate.ok ? <DangerBanner>{gate.reason}</DangerBanner> : null}
        </View>

        {job.draftDays.length > 1 ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {job.draftDays.map((d, i) => (
              <Pressable
                key={d.dayIndex}
                onPress={() => setDayIndex(i)}
                className={`rounded-xl border px-3 py-2 ${
                  i === dayIndex
                    ? "border-sleep-accent bg-sleep-accent"
                    : "border-sleep-line bg-sleep-bgDeep/70"
                }`}
              >
                <Text
                  className={`font-sansMed text-sm ${
                    i === dayIndex ? "text-sleep-bg" : "text-sleep-ink"
                  }`}
                >
                  Dia {d.dayIndex}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Card className="mt-4">
          <Text className="font-sansMed text-sleep-ink mb-2">
            Métricas previstas
          </Text>
          <MetricsPanel metrics={metrics} />
        </Card>

        <Card className="mt-4">
          <DayForm value={form} onChange={onChangeForm} />
          <View className="h-3" />
          <PrimaryButton
            label={
              saving
                ? "Gravando…"
                : job.status === "confirmed"
                  ? "Já confirmado"
                  : "Confirmar e gravar"
            }
            onPress={() => void onConfirm()}
            disabled={saving || !gate.ok || job.status === "confirmed"}
          />
        </Card>
      </AppScrollView>
    </Screen>
  );
}
