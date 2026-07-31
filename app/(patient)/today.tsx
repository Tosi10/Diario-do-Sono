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
import { DIARY_CUTOFF_HOUR } from "@/src/constants/collections";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  canSaveDay,
  formatIsoDatePt,
  isPastNoon,
  toIsoDate,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
  saveDayEntry,
} from "@/src/services/diary";
import { emptyDayInput, type SleepDayInput, type SonoDay } from "@/src/types";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { DayForm } from "@/src/components/DayForm";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PatientTodayScreen() {
  const { user, profile } = useAuth();
  const todayIso = toIsoDate(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<SonoDay | null>(null);
  const [form, setForm] = useState<SleepDayInput>(emptyDayInput(todayIso));

  const gate = useMemo(
    () =>
      canSaveDay(todayIso, new Date(), {
        allowPastByProfessional: false,
      }),
    [todayIso]
  );

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const week = await ensureActiveWeek({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      const days = await listDaysForWeek(week.weekId);
      const day = days.find((d) => d.date === todayIso) ?? null;
      setExisting(day);
      if (day) setForm(day.input);
      else setForm(emptyDayInput(todayIso));
    } catch (e) {
      Alert.alert(
        "Erro",
        e instanceof Error ? e.message : "Falha ao carregar o dia"
      );
    } finally {
      setLoading(false);
    }
  }, [user, profile, todayIso]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!user || !profile) return;
    if (!gate.ok) {
      Alert.alert("Bloqueado", gate.reason);
      return;
    }
    try {
      setSaving(true);
      const saved = await saveDayEntry({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
        actorUid: user.uid,
        actorRole: "patient",
        input: { ...form, date: todayIso },
        entrySource: "manual",
      });
      setExisting(saved);
      Alert.alert("Salvo", "Diário de hoje registrado.");
    } catch (e) {
      Alert.alert(
        "Não salvou",
        e instanceof Error ? e.message : "Erro desconhecido"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A3B899" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="font-sansMed text-sm text-sleep-accent">← Início</Text>
        </Pressable>
        <Eyebrow>Registro de hoje</Eyebrow>
        <Title>Esta manhã</Title>
        <Subtitle>
          {formatIsoDatePt(todayIso)} · preencha ao acordar, com calma.
        </Subtitle>

        <View className="mt-4 gap-3">
          {isPastNoon() ? (
            <DangerBanner>
              Já passou do meio-dia ({DIARY_CUTOFF_HOUR}:00). Não é possível
              adicionar ou alterar os dados de hoje — regra de consistência do
              método.
            </DangerBanner>
          ) : (
            <InfoBanner>
              Você pode preencher até {DIARY_CUTOFF_HOUR}:00. Depois disso o dia
              fecha.
            </InfoBanner>
          )}

          {!profile?.linkedProfessionalId ? (
            <InfoBanner>
              Ainda sem vínculo com a profissional. Vá em Perfil e use o código
              dela.
            </InfoBanner>
          ) : null}

          {existing ? (
            <Card>
              <Text className="font-sansMed text-sleep-ok mb-2">
                Dia já registrado
                {existing.entrySource === "professional"
                  ? " (pela profissional)"
                  : ""}
              </Text>
              <MetricsPanel metrics={existing.metrics} />
            </Card>
          ) : null}

          <Card>
            <DayForm
              value={form}
              onChange={setForm}
              disabled={!gate.ok}
            />
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
              disabled={saving || !gate.ok}
            />
          </Card>
        </View>
      </AppScrollView>
    </Screen>
  );
}
