import { CycleHistoryList } from "@/src/components/CycleHistoryList";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import { MetricsPanel } from "@/src/components/MetricsPanel";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  Card,
  InfoBanner,
  PageHeader,
  PrimaryButton,
  SegmentTabs,
} from "@/src/components/ui";
import {
  formatIsoDatePt,
  formatMinutesAsHm,
  weekDateList,
} from "@/src/domain/timeHelpers";
import type { SonoDay, SonoWeek } from "@/src/types";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export type DiaryTab = "week" | "stats" | "history";

function weekGridTabLabel(week: SonoWeek): string {
  if (week.status === "open") return "Semana atual";
  const start = formatIsoDatePt(week.startDate).slice(0, 5);
  const end = formatIsoDatePt(week.endDate).slice(0, 5);
  return `${start}–${end}`;
}

type Props = {
  mode: "patient" | "professional";
  header: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    onBack?: () => void;
    backLabel?: string;
  };
  week: SonoWeek;
  weeks: SonoWeek[];
  days: SonoDay[];
  todayIso: string;
  canStartNew?: boolean;
  starting?: boolean;
  onStartNew?: () => void;
  onSelectWeek: (week: SonoWeek) => void;
  onOpenDay: (date: string) => void;
  historyHint?: string;
};

export function DiaryCycleScreenBody({
  mode,
  header,
  week,
  weeks,
  days,
  todayIso,
  canStartNew,
  starting,
  onStartNew,
  onSelectWeek,
  onOpenDay,
  historyHint = "Completos e incompletos ficam salvos para o acompanhamento.",
}: Props) {
  const [tab, setTab] = useState<DiaryTab>("week");

  const diaryTabs = useMemo(
    () => [
      { id: "week" as const, label: weekGridTabLabel(week) },
      { id: "stats" as const, label: "Estatísticas" },
      { id: "history" as const, label: "Histórico" },
    ],
    [week.weekId, week.status, week.startDate, week.endDate]
  );

  const weekTabLabel = weekGridTabLabel(week);

  const dates = weekDateList(week.startDate);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const isHistorical = week.status !== "open";

  const handleSelectWeek = (w: SonoWeek) => {
    onSelectWeek(w);
    setTab("week");
  };

  return (
    <View className="flex-1 px-5">
      <PageHeader
        eyebrow={header.eyebrow}
        title={header.title}
        subtitle={header.subtitle}
        onBack={header.onBack}
        backLabel={header.backLabel}
      />

      <SegmentTabs tabs={diaryTabs} active={tab} onChange={setTab} />

      <AppScrollView
        className="mt-3 flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ display: tab === "week" ? "flex" : "none" }}>
          {isHistorical ? (
            <InfoBanner>
              {mode === "patient"
                ? "Você está vendo um ciclo anterior (somente leitura). A profissional pode corrigir se for necessário."
                : "Ciclo fechado no histórico. Você ainda pode abrir qualquer dia para corrigir."}
            </InfoBanner>
          ) : null}

          {canStartNew && onStartNew ? (
            <View style={{ marginTop: isHistorical ? 12 : 0 }}>
              <PrimaryButton
                label={starting ? "Criando…" : "Iniciar novo ciclo"}
                onPress={onStartNew}
                disabled={starting}
              />
            </View>
          ) : null}

          <Card
            className={isHistorical || canStartNew ? "mt-4" : ""}
          >
            {dates.map((date, i) => {
                const day = byDate.get(date);
                const isToday = date === todayIso;
                const isFuture = date > todayIso;
                const canOpen = mode === "professional" || !isFuture;

                return (
                  <Pressable
                    key={date}
                    disabled={!canOpen}
                    onPress={() => {
                      if (!canOpen) return;
                      onOpenDay(date);
                    }}
                    className={`flex-row items-center justify-between py-3 ${
                      i < dates.length - 1 ? "border-b border-sleep-line" : ""
                    } ${isFuture && mode === "patient" ? "opacity-45" : ""}`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className="font-sansMed text-sleep-ink">
                        Dia {i + 1} · {formatIsoDatePt(date)}
                        {isToday ? " (hoje)" : ""}
                      </Text>
                      <Text className="mt-0.5 font-sans text-xs text-sleep-muted">
                        {mode === "professional"
                          ? day
                            ? `${day.entrySource === "professional" ? "Você registrou" : "Paciente registrou"} · EF ${day.metrics.efPatient}%`
                            : "Toque para preencher ou ler a folha"
                          : day
                            ? `Sono ~ ${formatMinutesAsHm(day.metrics.ttsPatient)} · EF ${day.metrics.efPatient}%${
                                isToday ? "" : " · ver"
                              }`
                            : isToday
                              ? "Toque para preencher"
                              : isFuture
                                ? "Ainda não chegou"
                                : "Sem registro · toque para ver"}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      {mode === "patient" ? (
                        <View
                          className={`h-2.5 w-2.5 rounded-full ${
                            day ? "bg-sleep-accent" : "bg-sleep-line"
                          }`}
                        />
                      ) : null}
                      {canOpen ? (
                        <Text className="font-sansMed text-xs text-sleep-accent">
                          {mode === "patient" &&
                          isToday &&
                          week.status === "open"
                            ? "Abrir"
                            : mode === "professional"
                              ? "Abrir"
                              : "Ver"}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
          </Card>
        </View>

        <View style={{ display: tab === "stats" ? "flex" : "none" }}>
          <Card>
            <Text className="mb-1 font-sansMed text-sleep-ink">
              Resumo clínico (médias)
            </Text>
            {week.averages ? (
              <MetricsPanel averages={week.averages} />
            ) : (
              <EmptyState
                compact
                image={emptyStateImages.ginkgo}
                title="Sem médias ainda"
                message={`Preencha os dias na aba ${weekTabLabel} para ver latência, tempo de sono, eficiência e demais indicadores.`}
              />
            )}
          </Card>
        </View>

        <View style={{ display: tab === "history" ? "flex" : "none" }}>
          <Card>
            <Text className="mb-1 font-sansMed text-sleep-ink">
              Histórico de ciclos
            </Text>
            <Text className="mb-2 font-sans text-xs text-sleep-muted">
              {historyHint}
            </Text>
            <CycleHistoryList
              weeks={weeks}
              selectedWeekId={week.weekId}
              onSelect={handleSelectWeek}
            />
          </Card>
        </View>
      </AppScrollView>
    </View>
  );
}
