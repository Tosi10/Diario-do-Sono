import {
  CYCLE_DAYS,
  MAX_MISSED_DAYS,
  MIN_FILLED_DAYS,
} from "@/src/constants/collections";
import {
  fillWindow,
  isFillWindowClosed,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import type { IsoDate, SonoWeek, TimeHHmm, WeekStatus } from "@/src/types";

export { fillWindow, isFillWindowClosed, isWithinFillWindow } from "@/src/domain/timeHelpers";

export function patientWindowCopy(wakeTime: TimeHHmm): {
  open: string;
  close: string;
} {
  const w = fillWindow(wakeTime);
  return { open: w.open, close: w.close };
}

export function cycleHasEnded(week: SonoWeek, now: Date = new Date()): boolean {
  const today = toIsoDate(now);
  if (today > week.endDate) return true;
  if (today < week.endDate) return false;
  if (!week.wakeTime) return false;
  return isFillWindowClosed(week.wakeTime, now);
}

export function evaluateMissedDays(
  week: SonoWeek,
  filledDates: IsoDate[],
  now: Date = new Date()
): IsoDate[] {
  if (!week.wakeTime) return [];
  const today = toIsoDate(now);
  const filled = new Set(filledDates);
  const missed: IsoDate[] = [];

  for (const date of weekDateList(week.startDate)) {
    if (filled.has(date)) continue;
    if (date > today) continue;
    if (date < today) {
      missed.push(date);
      continue;
    }
    if (isFillWindowClosed(week.wakeTime, now)) {
      missed.push(date);
    }
  }
  return missed;
}

export function nextCycleStatus(
  week: SonoWeek,
  filledDates: IsoDate[],
  now: Date = new Date()
): { status: WeekStatus; missedDayIds: IsoDate[] } {
  if (week.status === "reviewed") {
    return { status: week.status, missedDayIds: week.missedDayIds ?? [] };
  }

  const missed = evaluateMissedDays(week, filledDates, now);
  const filledCount = filledDates.length;

  if (missed.length >= MAX_MISSED_DAYS) {
    return { status: "failed", missedDayIds: missed };
  }

  if (cycleHasEnded(week, now)) {
    return {
      status: filledCount >= MIN_FILLED_DAYS ? "complete" : "failed",
      missedDayIds: missed,
    };
  }

  return { status: "open", missedDayIds: missed };
}

export function cycleProgressLabel(filled: number, missed: number): string {
  return `${filled}/${CYCLE_DAYS} preenchidos · ${missed} perdidos`;
}

export function cycleStatusLabel(status: WeekStatus): string {
  switch (status) {
    case "open":
      return "Em andamento";
    case "complete":
      return "Válido";
    case "failed":
      return "Incompleto";
    case "reviewed":
      return "Revisado";
    default:
      return status;
  }
}

export { MIN_FILLED_DAYS, MAX_MISSED_DAYS, CYCLE_DAYS };
