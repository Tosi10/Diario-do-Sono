import { DayForm } from "@/src/components/DayForm";
import {
  Card,
  DangerBanner,
  InfoBanner,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  canSaveDay,
  formatIsoDatePt,
  toIsoDate,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  getDay,
  listDaysForWeek,
  saveDayEntry,
} from "@/src/services/diary";
import { emptyDayInput, type SleepDayInput, type SonoDay } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

export default function ProfessionalFillDayScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{
    id: string;
    date?: string;
  }>();
  const { user, role } = useAuth();
  const dateIso = (dateParam as string) || toIsoDate(new Date());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<SonoDay | null>(null);
  const [form, setForm] = useState<SleepDayInput>(emptyDayInput(dateIso));

  const gate = useMemo(
    () =>
      canSaveDay(dateIso, new Date(), {
        allowPastByProfessional: true,
      }),
    [dateIso]
  );

  const load = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const week = await ensureActiveWeek({
        patientUid: id,
        professionalId: user.uid,
        around: new Date(dateIso + "T12:00:00"),
      });
      const days = await listDaysForWeek(week.weekId);
      const day =
        days.find((d) => d.date === dateIso) ??
        (await getDay(`${week.weekId}_${dateIso}`));
      setExisting(day);
      setForm(day ? day.input : emptyDayInput(dateIso));
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha");
    } finally {
      setLoading(false);
    }
  }, [id, user, dateIso]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!user || !id || !role) return;
    if (!gate.ok) {
      Alert.alert("Bloqueado", gate.reason);
      return;
    }
    try {
      setSaving(true);
      const saved = await saveDayEntry({
        patientUid: id,
        professionalId: user.uid,
        actorUid: user.uid,
        actorRole: role,
        input: { ...form, date: dateIso },
        entrySource: "professional",
      });
      setExisting(saved);
      Alert.alert("Salvo", "Registro do paciente atualizado.");
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
      <Screen edges="top">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#AC665C" />
        </View>
      </Screen>
    );
  }

  const isToday = dateIso === toIsoDate(new Date());

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
        <Title>Registrar dia</Title>
        <Text className="mt-1 font-sans text-sleep-muted">
          {formatIsoDatePt(dateIso)}
          {isToday ? " · hoje" : ""}
        </Text>

        <View className="mt-4 gap-3">
          {!gate.ok ? (
            <DangerBanner>{gate.reason}</DangerBanner>
          ) : (
            <InfoBanner>
              Você pode preencher ou corrigir este dia a qualquer hora — inclusive
              à noite ou em outra consulta. A regra do meio-dia vale só para o
              paciente.
            </InfoBanner>
          )}

          <SecondaryButton
            label="Ler folha em papel (foto)"
            onPress={() =>
              router.push({
                pathname: "/(professional)/ocr",
                params: { patientId: id, date: dateIso },
              })
            }
          />

          <Card>
            <DayForm value={form} onChange={setForm} disabled={!gate.ok} />
            <View className="h-3" />
            <PrimaryButton
              label={saving ? "Salvando…" : "Salvar pelo paciente"}
              onPress={onSave}
              disabled={saving || !gate.ok}
            />
          </Card>
        </View>
      </AppScrollView>
    </Screen>
  );
}
