/** Tipos de domínio — Diário do Sono */

export type SonoRole = "patient" | "professional" | "admin";

export type TimeHHmm = string; // "06:30"
export type Minutes = number;
export type IsoDate = string; // "2026-07-30"

export type EntrySource = "manual" | "ocr" | "professional";
export type WeekStatus = "open" | "complete" | "failed" | "reviewed";
export type TtsMode = "patient" | "computed";

/** Vínculo clínico com a Dra. Ana (app mono-doutora). */
export type LinkStatus =
  | "none"
  | "pending"
  | "active"
  | "blocked"
  | "removed";

export interface SonoUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: SonoRole;
  clinicName?: string | null;
  linkedProfessionalId?: string | null;
  /** Status do vínculo com a clínica (paciente). */
  linkStatus?: LinkStatus;
  inviteCode?: string | null;
  termsVersion: string;
  termsAcceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SleepDayInput {
  date: IsoDate;
  q0: TimeHHmm;
  q1: TimeHHmm;
  q2: TimeHHmm;
  q3: TimeHHmm;
  q4: Minutes;
  q5: number;
  q6: Minutes[];
  q7: Minutes;
  q8: string;
  q9: string;
  q10?: string;
  qualityFeel: number;
  qualityEnjoy: number;
}

export interface SleepDayMetrics {
  lis: Minutes;
  fdn: number;
  ta: Minutes;
  ttsPatient: Minutes;
  ttsComputed: Minutes;
  dpm: Minutes;
  ttc: Minutes;
  tta: Minutes;
  efPatient: number;
  efComputed: number;
}

export interface SleepWeekAverages {
  n: number;
  lis: number;
  fdn: number;
  ta: number;
  tts: number;
  dpm: number;
  ttc: number;
  tta: number;
  ef: number;
  qualityFeel: number;
  qualityEnjoy: number;
}

export interface SonoPatient {
  patientUid: string;
  professionalId: string;
  displayName: string;
  email: string;
  /** Espelha o vínculo clínico. Ativos entram na lista de diário. */
  status?: LinkStatus;
  /** Quando o paciente pediu vínculo (fila de aprovação). */
  requestedAt?: string | null;
  activeWeekId: string | null;
  filledDays: number;
  expectedDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface SonoWeek {
  weekId: string;
  patientUid: string;
  professionalId: string | null;
  startDate: IsoDate;
  endDate: IsoDate;
  /** Hora de acordar do ciclo (HH:mm). Travada no início. */
  wakeTime: TimeHHmm | null;
  status: WeekStatus;
  filledDayIds: string[];
  missedDayIds: string[];
  averages: SleepWeekAverages | null;
  ttsMode: TtsMode;
  source: "app" | "ocr" | "mixed";
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SonoDay {
  dayId: string;
  weekId: string;
  patientUid: string;
  dayIndex: number;
  date: IsoDate;
  input: SleepDayInput;
  metrics: SleepDayMetrics;
  entrySource: EntrySource;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export function emptyDayInput(date: IsoDate): SleepDayInput {
  return {
    date,
    q0: "",
    q1: "",
    q2: "",
    q3: "",
    q4: 0,
    q5: 0,
    q6: [],
    q7: 0,
    q8: "",
    q9: "",
    q10: "",
    qualityFeel: 5,
    qualityEnjoy: 5,
  };
}
