import {
  formatMinutesAsHm,
  minutesBetweenCrossingMidnight,
  morningDiffMinutes,
} from "@/src/domain/timeHelpers";
import type {
  Minutes,
  SleepDayInput,
  SleepDayMetrics,
  SleepWeekAverages,
  SonoDay,
  TtsMode,
} from "@/src/types";

/**
 * Métricas do rodapé "PARA USO DO PSICÓLOGO".
 * Equações extras da profissional entram depois neste módulo.
 */
export function computeDayMetrics(input: SleepDayInput): SleepDayMetrics {
  const lis = Math.max(0, input.q4 || 0);
  const fdn = Math.max(0, input.q5 || 0);
  const ta = (input.q6 || []).reduce((s, n) => s + Math.max(0, n || 0), 0);
  const ttsPatient = Math.max(0, input.q7 || 0);
  const dpm = morningDiffMinutes(input.q1, input.q0) ?? 0;
  const ttc = minutesBetweenCrossingMidnight(input.q2, input.q1) ?? 0;
  const ttsComputed = Math.max(0, ttc - (lis + ta));
  const tta = lis + ta + dpm;
  const efPatient = ttc > 0 ? (ttsPatient / ttc) * 100 : 0;
  const efComputed = ttc > 0 ? (ttsComputed / ttc) * 100 : 0;

  return {
    lis,
    fdn,
    ta,
    ttsPatient,
    ttsComputed,
    dpm,
    ttc,
    tta,
    efPatient: round1(efPatient),
    efComputed: round1(efComputed),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function pickTts(metrics: SleepDayMetrics, mode: TtsMode): Minutes {
  return mode === "computed" ? metrics.ttsComputed : metrics.ttsPatient;
}

export function pickEf(metrics: SleepDayMetrics, mode: TtsMode): number {
  return mode === "computed" ? metrics.efComputed : metrics.efPatient;
}

export function computeWeekAverages(
  days: SonoDay[],
  ttsMode: TtsMode = "patient"
): SleepWeekAverages | null {
  if (!days.length) return null;
  const n = days.length;
  const sum = {
    lis: 0,
    fdn: 0,
    ta: 0,
    tts: 0,
    dpm: 0,
    ttc: 0,
    tta: 0,
    ef: 0,
    qualityFeel: 0,
    qualityEnjoy: 0,
  };

  for (const d of days) {
    sum.lis += d.metrics.lis;
    sum.fdn += d.metrics.fdn;
    sum.ta += d.metrics.ta;
    sum.tts += pickTts(d.metrics, ttsMode);
    sum.dpm += d.metrics.dpm;
    sum.ttc += d.metrics.ttc;
    sum.tta += d.metrics.tta;
    sum.ef += pickEf(d.metrics, ttsMode);
    sum.qualityFeel += d.input.qualityFeel;
    sum.qualityEnjoy += d.input.qualityEnjoy;
  }

  return {
    n,
    lis: round1(sum.lis / n),
    fdn: round1(sum.fdn / n),
    ta: round1(sum.ta / n),
    tts: round1(sum.tts / n),
    dpm: round1(sum.dpm / n),
    ttc: round1(sum.ttc / n),
    tta: round1(sum.tta / n),
    ef: round1(sum.ef / n),
    qualityFeel: round1(sum.qualityFeel / n),
    qualityEnjoy: round1(sum.qualityEnjoy / n),
  };
}

export function metricsLabels(metrics: SleepDayMetrics): Record<string, string> {
  return {
    LIS: formatMinutesAsHm(metrics.lis),
    FDN: String(metrics.fdn),
    TA: formatMinutesAsHm(metrics.ta),
    TTS: formatMinutesAsHm(metrics.ttsPatient),
    "TTS calc.": formatMinutesAsHm(metrics.ttsComputed),
    DPM: formatMinutesAsHm(metrics.dpm),
    TTC: formatMinutesAsHm(metrics.ttc),
    TTA: formatMinutesAsHm(metrics.tta),
    EF: `${metrics.efPatient}%`,
  };
}
