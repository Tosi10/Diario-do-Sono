import { showAppAlert } from "@/src/components/AppAlert";
import { DayForm } from "@/src/components/DayForm";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  Card,
  DangerBanner,
  InfoBanner,
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  screenScrollContent,
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
import { Image, Pressable, Text, View } from "react-native";

export function OcrReviewScreen() {
  const { jobId, patientId, weekId, date: dateParam } = useLocalSearchParams<{
    jobId: string;
    patientId?: string;
    weekId?: string;
    date?: string;
  }>();
  const { user, profile, role } = useAuth();
  const initial = jobId ? getOcrJob(jobId) : null;
  const [job, setJob] = useState<OcrJob | null>(initial);
  const [dayIndex, setDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const weekIdParam =
    typeof weekId === "string" && weekId ? weekId : undefined;
  const patientIdParam =
    typeof patientId === "string" && patientId
      ? patientId
      : job?.patientUid;

  const goBackToOcr = () => {
    router.replace({
      pathname: "/(professional)/ocr",
      params: {
        ...(patientIdParam ? { patientId: patientIdParam } : {}),
        ...(weekIdParam ? { weekId: weekIdParam } : {}),
        ...(typeof dateParam === "string" ? { date: dateParam } : {}),
      },
    });
  };

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
        <View className="flex-1 px-5">
          <PageHeader
            title="Leitura não encontrada"
            onBack={() => router.back()}
          />
          <EmptyState
            image={emptyStateImages.rest}
            title="Sem dados para revisar"
            message="Volte e fotografe a folha de novo, ou escolha uma leitura recente."
          />
          <View className="mt-4">
            <SecondaryButton label="Voltar" onPress={() => router.back()} />
          </View>
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
      showAppAlert("Bloqueado", gate.reason);
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
      showAppAlert("Confirmado", "Dados da folha gravados no diário.", [
        {
          text: "OK",
          onPress: () => {
            if (role === "professional" || role === "admin") {
              router.replace({
                pathname: "/(professional)/patient/[id]/day",
                params: {
                  id: job.patientUid,
                  date: form.date,
                  ...(weekIdParam ? { weekId: weekIdParam } : {}),
                },
              });
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (e) {
      showAppAlert(
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
        contentContainerStyle={screenScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          eyebrow="Conferir antes de gravar"
          title="Revisar leitura"
          subtitle={`${job.patientName} · ${formatIsoDatePt(form.date)}`}
          onBack={goBackToOcr}
          backLabel="Folha em papel"
        />

        <Image
          source={{ uri: job.imageUri }}
          className="mt-2 h-44 w-full rounded-xl"
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
          <Text className="mb-2 font-sansMed text-sleep-ink">
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
