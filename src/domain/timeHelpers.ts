import { CLINIC_TIMEZONE } from "@/src/constants/collections";
import { FILL_WINDOW_MINUTES } from "@/src/constants/collections";
import type { IsoDate, Minutes, TimeHHmm } from "@/src/types";

/** Parse "HH:mm" → minutos desde 00:00. Retorna null se inválido. */
export function parseTimeToMinutes(time: TimeHHmm): Minutes | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function formatHHmm(totalMinutes: number): TimeHHmm {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatMinutesAsHm(total: Minutes): string {
  const safe = Math.max(0, Math.round(total));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Intervalo em minutos de `from` → `to`, cruzando meia-noite se necessário.
 * Ex.: 23:00 → 06:30 = 450.
 */
export function minutesBetweenCrossingMidnight(
  from: TimeHHmm,
  to: TimeHHmm
): Minutes | null {
  const a = parseTimeToMinutes(from);
  const b = parseTimeToMinutes(to);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

/** Diferença matutina simples (mesmo período). Ex.: 06:30 − 06:00 = 30. */
export function morningDiffMinutes(
  later: TimeHHmm,
  earlier: TimeHHmm
): Minutes | null {
  const a = parseTimeToMinutes(earlier);
  const b = parseTimeToMinutes(later);
  if (a === null || b === null) return null;
  return Math.max(0, b - a);
}

/** Data/hora no fuso do consultório (não no fuso do emulador). */
export function getClinicDateParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function clinicMinutesNow(now: Date = new Date()): number {
  const p = getClinicDateParts(now);
  return p.hour * 60 + p.minute;
}

/**
 * Janela do paciente: da hora de acordar até +5h (Brasília).
 * O push de lembrete (+10 min) é só aviso — se já preencheu, cancela.
 */
export function fillWindow(wakeTime: TimeHHmm): {
  open: TimeHHmm;
  close: TimeHHmm;
  openMin: number;
  closeMin: number;
} {
  const wake = parseTimeToMinutes(wakeTime);
  if (wake === null) {
    throw new Error("Horário de acordar inválido.");
  }
  const openMin = wake;
  const closeMin = wake + FILL_WINDOW_MINUTES;
  return {
    open: formatHHmm(openMin),
    close: formatHHmm(closeMin),
    openMin,
    closeMin,
  };
}

export function isWithinFillWindow(
  wakeTime: TimeHHmm,
  now: Date = new Date()
): boolean {
  const { openMin, closeMin } = fillWindow(wakeTime);
  const n = clinicMinutesNow(now);
  if (closeMin <= 24 * 60) {
    return n >= openMin && n < closeMin;
  }
  const closeWrapped = closeMin - 24 * 60;
  return n >= openMin || n < closeWrapped;
}

export function isFillWindowClosed(
  wakeTime: TimeHHmm,
  now: Date = new Date()
): boolean {
  const { openMin, closeMin } = fillWindow(wakeTime);
  const n = clinicMinutesNow(now);
  if (closeMin <= 24 * 60) {
    return n >= closeMin;
  }
  const closeWrapped = closeMin - 24 * 60;
  return n >= closeWrapped && n < openMin;
}

/** Dia civil no fuso do consultório (YYYY-MM-DD). */
export function toIsoDate(d: Date): IsoDate {
  const p = getClinicDateParts(d);
  const m = String(p.month).padStart(2, "0");
  const day = String(p.day).padStart(2, "0");
  return `${p.year}-${m}-${day}`;
}

export function parseIsoDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!, 12, 0, 0, 0);
}

export function formatIsoDatePt(iso: IsoDate): string {
  const d = parseIsoDate(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/** Segunda-feira da semana (fuso do consultório) que contém `date`. */
export function startOfWeekMonday(date: Date): Date {
  const p = getClinicDateParts(date);
  const d = new Date(p.year, p.month - 1, p.day, 12, 0, 0, 0);
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function weekDateList(startIso: IsoDate): IsoDate[] {
  const start = parseIsoDate(startIso);
  return Array.from({ length: 7 }, (_, i) => toIsoDate(addDays(start, i)));
}

export function dayIndexInWeek(startIso: IsoDate, dateIso: IsoDate): number {
  const dates = weekDateList(startIso);
  const idx = dates.indexOf(dateIso);
  return idx >= 0 ? idx + 1 : 1;
}

/**
 * Protocolo do ciclo (Sprint 8):
 * - Paciente: só o dia de hoje, na janela wakeTime … wakeTime+5h.
 * - Profissional: hoje e passado a qualquer hora; nunca futuro.
 */
export type SaveDayGate =
  | { ok: true }
  | { ok: false; reason: string };

export function canSaveDay(
  morningDateIso: IsoDate,
  now: Date = new Date(),
  options?: {
    allowPastByProfessional?: boolean;
    wakeTime?: TimeHHmm | null;
    cycleClosed?: boolean;
  }
): SaveDayGate {
  const asProfessional = options?.allowPastByProfessional === true;
  const todayIso = toIsoDate(now);
  const morning = parseIsoDate(morningDateIso);
  const today = parseIsoDate(todayIso);

  if (morning.getTime() > today.getTime()) {
    return { ok: false, reason: "Não é possível preencher um dia futuro." };
  }

  if (asProfessional) {
    return { ok: true };
  }

  if (options?.cycleClosed) {
    return {
      ok: false,
      reason:
        "Este ciclo já foi encerrado. Você pode rever os dias; a profissional corrige se for necessário.",
    };
  }

  if (morningDateIso !== todayIso) {
    return {
      ok: false,
      reason:
        "Só é possível preencher o dia de hoje, na janela combinada. Peça à profissional para registrar dias anteriores.",
    };
  }

  const wakeTime = options?.wakeTime;
  if (!wakeTime) {
    return {
      ok: false,
      reason:
        "Defina a hora de acordar deste ciclo antes de preencher o diário. Ela fica fixa pelos 7 dias.",
    };
  }

  if (!isWithinFillWindow(wakeTime, now)) {
    const w = fillWindow(wakeTime);
    return {
      ok: false,
      reason: `A janela de hoje é das ${w.open} às ${w.close} (Brasília), a partir da hora de acordar do ciclo. Fora desse horário o dia fica bloqueado para você.`,
    };
  }

  return { ok: true };
}
