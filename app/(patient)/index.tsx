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
import { mapaDoSono } from "@/src/content/mapaDoSono";
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
import { brand } from "@/src/theme/brand";
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
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <View className="mb-6 items-center">
          <BrandMark size="sm" />
          <Eyebrow>{mapaDoSono.title}</Eyebrow>
          <Text className="mt-2 text-center font-displayBold text-2xl text-sleep-ink">
            Olá, {profile?.displayName?.split(" ")[0] || "bem-vindo"}
          </Text>
        </View>

        <Title>Início</Title>
        <Subtitle>
          {formatIsoDatePt(todayIso)} · {mapaDoSono.subtitle}
        </Subtitle>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
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
                Sobre o Sono à Vista
              </Text>
              <Text className="mt-2 font-displayBold text-xl text-sleep-ink">
                {mapaDoSono.welcomeTitle}
              </Text>
              <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                {mapaDoSono.welcomeBody[0]}
              </Text>
              <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                {mapaDoSono.welcomeBody[1]}
              </Text>
              <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                {mapaDoSono.welcomeBody[2]}
              </Text>
              <Text className="mt-2 font-displayItalic text-sm text-sleep-rose leading-5">
                {mapaDoSono.welcomeBody[3]}
              </Text>
            </Card>

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
                    : `Preencha ao acordar, até ${DIARY_CUTOFF_HOUR}:00. ${mapaDoSono.welcomeCta}`}
              </Text>
              <View className="mt-4">
                <PrimaryButton
                  label={
                    filledToday
                      ? "Ver / editar hoje"
                      : pastNoon
                        ? "Ver detalhes de hoje"
                        : "Preencher o diário de hoje"
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
