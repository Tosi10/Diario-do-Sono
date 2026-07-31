import { BrandMark } from "@/src/components/BrandMark";
import {
  Card,
  Eyebrow,
  InfoBanner,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { DIARY_CUTOFF_HOUR } from "@/src/constants/collections";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  formatIsoDatePt,
  isPastNoon,
  toIsoDate,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
} from "@/src/services/diary";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { ActivityIndicator, Text, View } from "react-native";

export default function PatientHomeScreen() {
  const { user, profile } = useAuth();
  const todayIso = toIsoDate(new Date());
  const [loading, setLoading] = useState(true);
  const [filledToday, setFilledToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user || !profile) return;
        setLoading(true);
        try {
          const week = await ensureActiveWeek({
            patientUid: user.uid,
            professionalId: profile.linkedProfessionalId ?? null,
          });
          const days = await listDaysForWeek(week.weekId);
          if (!alive) return;
          setFilledToday(days.some((d) => d.date === todayIso));
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [user, profile, todayIso])
  );

  const pastNoon = isPastNoon();

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <View className="mb-6 flex-row items-center gap-3">
          <BrandMark size="sm" />
          <View className="flex-1">
            <Eyebrow>Diário do Sono</Eyebrow>
            <Text className="mt-1 font-displayBold text-2xl text-sleep-ink">
              Olá, {profile?.displayName?.split(" ")[0] || "bem-vindo"}
            </Text>
          </View>
        </View>

        <Title>Início</Title>
        <Subtitle>
          {formatIsoDatePt(todayIso)} · um passo de manhã, sem pressa.
        </Subtitle>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#A3B899" />
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {!profile?.linkedProfessionalId ? (
              <InfoBanner>
                Ainda sem vínculo com a profissional. Em Perfil, use o código
                dela.
              </InfoBanner>
            ) : null}

            <Card>
              <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                Manhã de hoje
              </Text>
              <Text className="mt-2 font-displayBold text-2xl text-sleep-ink">
                {filledToday
                  ? "Registro feito"
                  : pastNoon
                    ? "Dia fechado"
                    : "Ainda não preenchido"}
              </Text>
              <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                {filledToday
                  ? "Você já registrou o sono de hoje. Pode revisar se ainda for antes do meio-dia."
                  : pastNoon
                    ? `Após ${DIARY_CUTOFF_HOUR}:00 o dia fecha. Se precisar, a profissional registra por você.`
                    : `Preencha ao acordar, até ${DIARY_CUTOFF_HOUR}:00.`}
              </Text>
              <View className="mt-4">
                <PrimaryButton
                  label={
                    filledToday
                      ? "Ver / editar hoje"
                      : pastNoon
                        ? "Ver detalhes de hoje"
                        : "Preencher o dia de hoje"
                  }
                  onPress={() => router.push("/(patient)/today")}
                />
              </View>
            </Card>
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
