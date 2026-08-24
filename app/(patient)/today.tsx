import { showAppAlert } from "@/src/components/AppAlert";
import {
  Card,
  Eyebrow,
  DangerBanner,
  InfoBanner,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { patientWindowCopy } from "@/src/domain/cycleProtocol";
import {
  canSaveDay,
  formatIsoDatePt,
  toIsoDate,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
  saveDayEntry,
} from "@/src/services/diary";
import {
  emptyDayInput,
  type SleepDayInput,
  type SonoDay,
  type SonoWeek,
} from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { DayForm } from "@/src/components/DayForm";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PatientDayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { user, profile } = useAuth();
  const todayIso = toIsoDate(new Date());
  const dateIso =
    typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : todayIso;

  const isToday = dateIso === todayIso;
  const isPast = dateIso < todayIso;
  const isFuture = dateIso > todayIso;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<SonoDay | null>(null);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [form, setForm] = useState<SleepDayInput>(emptyDayInput(dateIso));

  const gate = useMemo(
    () =>
      canSaveDay(dateIso, new Date(), {
        allowPastByProfessional: false,
        wakeTime: week?.wakeTime,
        cycleClosed: week?.status === "failed" || week?.status === "complete",
      }),
    [dateIso, week]
  );

  const canEdit = isToday && gate.ok;
  const readOnly = !canEdit;

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const w = await ensureActiveWeek({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
        around: new Date(dateIso + "T12:00:00"),
      });
      const days = await listDaysForWeek(w.weekId);
      const day = days.find((d) => d.date === dateIso) ?? null;
      setWeek(w);
      setExisting(day);
      if (day) setForm(day.input);
      else setForm(emptyDayInput(dateIso));
    } catch (e) {
      showAppAlert(
        "Erro",
        e instanceof Error ? e.message : "Falha ao carregar o dia"
      );
    } finally {
      setLoading(false);
    }
  }, [user, profile, dateIso]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!user || !profile || !canEdit) return;
    try {
      setSaving(true);
      const saved = await saveDayEntry({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
        actorUid: user.uid,
        actorRole: "patient",
        input: { ...form, date: dateIso },
        entrySource: "manual",
        week: week ?? undefined,
      });
      setExisting(saved);
      const refreshed = await ensureActiveWeek({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      setWeek(refreshed);
      showAppAlert("Salvo", "Diário de hoje registrado.");
    } catch (e) {
      showAppAlert(
        "Não salvou",
        e instanceof Error ? e.message : "Erro desconhecido"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen edges="top">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#AC665C" />
        </View>
      </Screen>
    );
  }

  if (isFuture) {
    return (
      <Screen edges="top">
        <View className="flex-1 px-5 pt-8">
          <Pressable onPress={() => router.back()} className="mb-2">
            <Text className="font-sansMed text-sm text-sleep-accent">
              ← Voltar
            </Text>
          </Pressable>
          <Title>Dia futuro</Title>
          <InfoBanner>
            Ainda não é possível abrir um dia que não chegou.
          </InfoBanner>
        </View>
      </Screen>
    );
  }

  const windowLabel = week?.wakeTime
    ? patientWindowCopy(week.wakeTime)
    : null;

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="font-sansMed text-sm text-sleep-accent">
            ← Voltar
          </Text>
        </Pressable>
        <Eyebrow>{isToday ? "Registro de hoje" : "Histórico"}</Eyebrow>
        <Title>{isToday ? "Esta manhã" : "Dia registrado"}</Title>
        <Subtitle>
          {formatIsoDatePt(dateIso)}
          {isToday
            ? windowLabel
              ? ` · janela ${windowLabel.open}–${windowLabel.close}`
              : " · defina a hora do ciclo no Início"
            : " · só consulta — sem edição."}
        </Subtitle>

        <View className="mt-4 gap-3">
          {isPast ? (
            <InfoBanner>
              Dias anteriores ficam disponíveis para você rever o que anotou.
              Só a profissional pode alterar depois.
            </InfoBanner>
          ) : isToday && !gate.ok ? (
            <DangerBanner>{gate.reason}</DangerBanner>
          ) : isToday && windowLabel ? (
            <InfoBanner>
              Você pode preencher até {windowLabel.close} (Brasília). Depois o
              dia fecha para você.
            </InfoBanner>
          ) : null}

          {!profile?.linkedProfessionalId ? (
            <InfoBanner>
              Ainda sem vínculo com a profissional. Vá em Perfil e use o código
              dela.
            </InfoBanner>
          ) : null}

          {existing ? (
            <InfoBanner>
              {readOnly ? "Registro deste dia" : "Dia já registrado"}
              {existing.entrySource === "professional"
                ? " (preenchido pela profissional)."
                : "."}{" "}
              Métricas e médias da semana ficam na aba Diário.
            </InfoBanner>
          ) : isPast ? (
            <InfoBanner>
              Não há registro neste dia. Se precisar preencher depois, fale com
              a profissional.
            </InfoBanner>
          ) : null}

          {existing || canEdit ? (
            <Card>
              <DayForm
                value={form}
                onChange={setForm}
                disabled={readOnly}
              />
              {canEdit ? (
                <>
                  <View className="h-3" />
                  <PrimaryButton
                    label={
                      saving
                        ? "Salvando…"
                        : existing
                          ? "Atualizar hoje"
                          : "Salvar hoje"
                    }
                    onPress={onSave}
                    disabled={saving}
                  />
                </>
              ) : existing ? (
                <Text className="mt-3 font-sans text-xs text-sleep-muted text-center">
                  Somente leitura
                </Text>
              ) : null}
            </Card>
          ) : null}
        </View>
      </AppScrollView>
    </Screen>
  );
}
