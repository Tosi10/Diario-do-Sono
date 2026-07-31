import { formatMinutesAsHm } from "@/src/domain/timeHelpers";
import type { SleepDayMetrics, SleepWeekAverages, TtsMode } from "@/src/types";
import { Text, View } from "react-native";

type MetricRow = {
  code: string;
  label: string;
  value: string;
};

function dayRows(
  metrics: SleepDayMetrics,
  ttsMode: TtsMode
): MetricRow[] {
  const tts =
    ttsMode === "computed" ? metrics.ttsComputed : metrics.ttsPatient;
  const ef =
    ttsMode === "computed" ? metrics.efComputed : metrics.efPatient;

  return [
    {
      code: "LIS",
      label: "Latência para iniciar o sono",
      value: formatMinutesAsHm(metrics.lis),
    },
    {
      code: "FDN",
      label: "Despertares no meio da noite",
      value: String(metrics.fdn),
    },
    {
      code: "TA",
      label: "Tempo acordado no meio do sono",
      value: formatMinutesAsHm(metrics.ta),
    },
    {
      code: "TTS",
      label: "Tempo total de sono",
      value: formatMinutesAsHm(tts),
    },
    {
      code: "DPM",
      label: "Tempo na cama após acordar",
      value: formatMinutesAsHm(metrics.dpm),
    },
    {
      code: "TTC",
      label: "Tempo total na cama",
      value: formatMinutesAsHm(metrics.ttc),
    },
    {
      code: "TTA",
      label: "Tempo total acordado",
      value: formatMinutesAsHm(metrics.tta),
    },
    {
      code: "EF",
      label: "Eficiência do sono",
      value: `${ef}%`,
    },
  ];
}

function averageRows(averages: SleepWeekAverages): MetricRow[] {
  return [
    {
      code: "n",
      label: "Dias usados na média",
      value: String(averages.n),
    },
    {
      code: "LIS",
      label: "Latência para iniciar o sono",
      value: formatMinutesAsHm(averages.lis),
    },
    {
      code: "FDN",
      label: "Despertares no meio da noite",
      value: String(averages.fdn),
    },
    {
      code: "TA",
      label: "Tempo acordado no meio do sono",
      value: formatMinutesAsHm(averages.ta),
    },
    {
      code: "TTS",
      label: "Tempo total de sono",
      value: formatMinutesAsHm(averages.tts),
    },
    {
      code: "DPM",
      label: "Tempo na cama após acordar",
      value: formatMinutesAsHm(averages.dpm),
    },
    {
      code: "TTC",
      label: "Tempo total na cama",
      value: formatMinutesAsHm(averages.ttc),
    },
    {
      code: "TTA",
      label: "Tempo total acordado",
      value: formatMinutesAsHm(averages.tta),
    },
    {
      code: "EF",
      label: "Eficiência do sono",
      value: `${averages.ef}%`,
    },
  ];
}

/**
 * Painel clínico — lista vertical, tipografia legível.
 * São as métricas do rodapé do PDF (médias dos dias preenchidos).
 */
export function MetricsPanel({
  metrics,
  averages,
  ttsMode = "patient",
}: {
  metrics?: SleepDayMetrics | null;
  averages?: SleepWeekAverages | null;
  ttsMode?: TtsMode;
}) {
  if (!metrics && !averages) {
    return (
      <Text className="font-sans text-sm text-sleep-muted">
        Sem métricas ainda.
      </Text>
    );
  }

  const rows = averages
    ? averageRows(averages)
    : dayRows(metrics!, ttsMode);

  return (
    <View className="w-full">
      {averages ? (
        <Text className="mb-3 font-sans text-xs text-sleep-muted leading-5">
          Média dos {averages.n} dia(s) já preenchido(s) nesta semana — os
          mesmos cálculos do diário em papel (LIS, FDN, TA…).
        </Text>
      ) : null}

      <View className="w-full overflow-hidden rounded-2xl border border-sleep-line/70">
        {rows.map((row, i) => (
          <View
            key={row.code}
            className={`w-full flex-row items-center justify-between gap-3 px-3.5 py-3 ${
              i < rows.length - 1 ? "border-b border-sleep-line/60" : ""
            } bg-sleep-bgDeep/40`}
          >
            <View className="min-w-0 flex-1 pr-2">
              <Text className="font-sans text-[13px] text-sleep-ink leading-5">
                {row.label}
              </Text>
              <Text className="mt-0.5 font-sansMed text-[11px] text-sleep-lavender">
                {row.code}
              </Text>
            </View>
            <Text className="shrink-0 font-sansBold text-base text-sleep-rose">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
