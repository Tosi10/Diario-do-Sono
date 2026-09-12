import { showAppAlert } from "@/src/components/AppAlert";
import {
  CycleOutcomeCard,
  CycleWakeSetupCard,
} from "@/src/components/CycleCards";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import {
  Card,
  Eyebrow,
  GreetingBlock,
  PageHeader,
  PrimaryButton,
  Screen,
  SectionTitle,
  Title,
  screenScrollContent,
} from "@/src/components/ui";
import { mapaDoSono } from "@/src/content/mapaDoSono";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  cycleProgressLabel,
  patientWindowCopy,
} from "@/src/domain/cycleProtocol";
import {
  fillWindow,
  formatIsoDatePt,
  isWithinFillWindow,
  parseTimeToMinutes,
  toIsoDate,
} from "@/src/domain/timeHelpers";
import {
  ensureActiveWeek,
  listDaysForWeek,
  listWeeksForPatient,
  setWeekWakeTime,
  startNewCycle,
} from "@/src/services/diary";
import { brand } from "@/src/theme/brand";
import type { LinkStatus, SonoWeek } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { ActivityIndicator, Text, View } from "react-native";

function resolveLinkStatus(profile: {
  linkStatus?: LinkStatus;
  linkedProfessionalId?: string | null;
}): LinkStatus {
  if (profile.linkStatus) return profile.linkStatus;
  return profile.linkedProfessionalId ? "active" : "none";
}

export default function PatientHomeScreen() {
  const { user, profile } = useAuth();
  const todayIso = toIsoDate(new Date());
  const [loading, setLoading] = useState(true);
  const [filledToday, setFilledToday] = useState(false);
  const [week, setWeek] = useState<SonoWeek | null>(null);
  const [wakeDraft, setWakeDraft] = useState("07:00");
  const [savingWake, setSavingWake] = useState(false);
  const [starting, setStarting] = useState(false);
  const [canStartNew, setCanStartNew] = useState(false);

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const w = await ensureActiveWeek({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      const days = await listDaysForWeek(w.weekId);
      const history = await listWeeksForPatient(user.uid);
      setWeek(w);
      setFilledToday(days.some((d) => d.date === todayIso));
      setCanStartNew(
        !history.some((h) => h.status === "open") &&
          history.some((h) => h.status === "complete" || h.status === "failed")
      );
    } finally {
      setLoading(false);
    }
  }, [user, profile, todayIso]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onConfirmWake = async () => {
    if (!week) return;
    if (parseTimeToMinutes(wakeDraft) === null) {
      showAppAlert("Horário inválido", "Use o formato HH:mm, por exemplo 07:00.");
      return;
    }
    try {
      setSavingWake(true);
      const updated = await setWeekWakeTime({
        weekId: week.weekId,
        wakeTime: wakeDraft.trim(),
      });
      setWeek(updated);
      showAppAlert(
        "Ciclo iniciado",
        `Hora de acordar fixada em ${updated.wakeTime}. A janela de hoje abre às ${fillWindow(updated.wakeTime!).open}. Lembretes locais ficam ativos no APK (no Expo Go o sistema não agenda push).`
      );
    } catch (e) {
      showAppAlert("Erro", e instanceof Error ? e.message : "Falha");
    } finally {
      setSavingWake(false);
    }
  };

  const onStartNew = async () => {
    if (!user || !profile) return;
    try {
      setStarting(true);
      const w = await startNewCycle({
        patientUid: user.uid,
        professionalId: profile.linkedProfessionalId ?? null,
      });
      setWeek(w);
      setCanStartNew(false);
      showAppAlert(
        "Novo ciclo",
        "Defina abaixo a hora de acordar desta semana."
      );
    } catch (e) {
      showAppAlert("Não foi possível", e instanceof Error ? e.message : "Erro");
    } finally {
      setStarting(false);
    }
  };

  const needsWake = week?.status === "open" && !week.wakeTime;
  const windowOpen =
    !!week?.wakeTime && isWithinFillWindow(week.wakeTime, new Date());
  const windowLabel = week?.wakeTime
    ? patientWindowCopy(week.wakeTime)
    : null;
  const linkStatus = profile ? resolveLinkStatus(profile) : "none";
  const clinicallyActive = linkStatus === "active";

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <GreetingBlock
          eyebrow={mapaDoSono.title}
          name={profile?.displayName?.split(" ")[0] || "bem-vindo"}
        />

        <PageHeader
          title="Início"
          subtitle={`${formatIsoDatePt(todayIso)} · ${mapaDoSono.subtitle}`}
        />

        {loading || !week ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {linkStatus === "pending" ? (
              <Card>
                <EmptyState
                  image={emptyStateImages.rest}
                  title="Aguardando a Dra. Ana"
                  message="Seu cadastro já está na fila dela. Quando aprovar, você poderá iniciar o ciclo e registrar as noites."
                />
              </Card>
            ) : null}

            {linkStatus === "blocked" ? (
              <Card>
                <EmptyState
                  image={emptyStateImages.ginkgo}
                  title="Acesso pausado"
                  message="A Dra. Ana bloqueou o diário por enquanto. Fale com ela na consulta para retomar."
                />
              </Card>
            ) : null}

            {linkStatus === "removed" || linkStatus === "none" ? (
              <Card>
                <EmptyState
                  image={emptyStateImages.rest}
                  title="Sem vínculo ativo"
                  message="O pedido de acesso ainda não está liberado. Se precisar, fale com a Dra. Ana na consulta."
                />
              </Card>
            ) : null}

            {clinicallyActive &&
            (week.status === "complete" || week.status === "failed") ? (
              <CycleOutcomeCard week={week} />
            ) : null}

            {clinicallyActive && canStartNew ? (
              <PrimaryButton
                label={starting ? "Criando…" : "Iniciar novo ciclo"}
                onPress={onStartNew}
                disabled={starting}
              />
            ) : null}

            {clinicallyActive && needsWake ? (
              <CycleWakeSetupCard
                wakeDraft={wakeDraft}
                onChangeDraft={setWakeDraft}
                onConfirm={onConfirmWake}
                saving={savingWake}
              />
            ) : null}

            {clinicallyActive && !needsWake && week.status === "open" ? (
              <Card>
                <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                  Ciclo atual
                </Text>
                <SectionTitle className="mt-2">Acordar às {week.wakeTime}</SectionTitle>
                <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                  {cycleProgressLabel(
                    week.filledDayIds.length,
                    week.missedDayIds?.length ?? 0
                  )}
                  {windowLabel
                    ? ` · janela hoje ${windowLabel.open}–${windowLabel.close}`
                    : ""}
                </Text>
              </Card>
            ) : null}

            <Card>
              <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                Sobre o Sono à Vista
              </Text>
              <SectionTitle className="mt-2">{mapaDoSono.welcomeTitle}</SectionTitle>
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

            {clinicallyActive ? (
              <Card>
                <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                  Manhã de hoje
                </Text>
                <Title>
                  {filledToday
                    ? "Registro feito"
                    : needsWake
                      ? "Defina a hora do ciclo"
                      : week.status !== "open"
                        ? "Ciclo encerrado"
                        : windowOpen
                          ? "Janela aberta"
                          : "Fora da janela"}
                </Title>
                <Text className="mt-2 font-sans text-sm text-sleep-muted leading-5">
                  {filledToday
                    ? windowOpen
                      ? "Você já registrou hoje e ainda pode ajustar enquanto a janela estiver aberta."
                      : "Registro de hoje salvo. A janela já fechou para novas edições."
                    : needsWake
                      ? "Primeiro confirme a hora de acordar desta semana."
                      : week.status !== "open"
                        ? "Este ciclo foi fechado. Revise o diário ou fale com a profissional."
                        : windowOpen && windowLabel
                          ? `Preencha até ${windowLabel.close} (Brasília). ${mapaDoSono.welcomeCta}`
                          : windowLabel
                            ? `Hoje a janela é das ${windowLabel.open} às ${windowLabel.close}. Se perder o prazo, a profissional pode registrar.`
                            : "Aguarde a abertura da janela de preenchimento."}
                </Text>
                <View className="mt-4">
                  <PrimaryButton
                    label={
                      filledToday
                        ? "Ver / editar hoje"
                        : needsWake
                          ? "Definir hora acima"
                          : "Abrir diário de hoje"
                    }
                    onPress={() => {
                      if (needsWake) return;
                      router.push("/(patient)/today");
                    }}
                    disabled={needsWake}
                  />
                </View>
              </Card>
            ) : null}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
