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
      label: "Tempo de sono nesta noite",
      value: formatMinutesAsHm(tts),
    },
    {
      code: "DPM",
      label: "Tempo na cama após acordar",
      value: formatMinutesAsHm(metrics.dpm),
    },
    {
      code: "TTC",
      label: "Tempo na cama nesta noite",
      value: formatMinutesAsHm(metrics.ttc),
    },
    {
      code: "TTA",
      label: "Tempo acordado nesta noite",
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
      label: "Média da latência para iniciar o sono",
      value: formatMinutesAsHm(averages.lis),
    },
    {
      code: "FDN",
      label: "Média de despertares no meio da noite",
      value: String(averages.fdn),
    },
    {
      code: "TA",
      label: "Média do tempo acordado no meio do sono",
      value: formatMinutesAsHm(averages.ta),
    },
    {
      code: "TTS",
      label: "Média do tempo de sono por noite",
      value: formatMinutesAsHm(averages.tts),
    },
    {
      code: "DPM",
      label: "Média do tempo na cama após acordar",
      value: formatMinutesAsHm(averages.dpm),
    },
    {
      code: "TTC",
      label: "Média do tempo na cama por noite",
      value: formatMinutesAsHm(averages.ttc),
    },
    {
      code: "TTA",
      label: "Média do tempo acordado por noite",
      value: formatMinutesAsHm(averages.tta),
    },
    {
      code: "EF",
      label: "Média da eficiência do sono",
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
          Cada valor abaixo é a média por noite entre os {averages.n} dia(s)
          preenchidos nesta semana (não a soma). Mesmos cálculos do diário em
          papel (LIS, FDN, TA…).
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
