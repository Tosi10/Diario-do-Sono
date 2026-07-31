/**
 * Modo demo — memória local, sem Firebase.
 * Ativo automaticamente quando não há .env configurado.
 */
import { computeDayMetrics, computeWeekAverages } from "@/src/domain/sleepMetrics";
import {
  addDays,
  canSaveDay,
  dayIndexInWeek,
  startOfWeekMonday,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import { TERMS_VERSION } from "@/src/constants/collections";
import { emptyDayInput } from "@/src/types";
import type {
  EntrySource,
  IsoDate,
  SleepDayInput,
  SonoDay,
  SonoPatient,
  SonoRole,
  SonoUserProfile,
  SonoWeek,
  TtsMode,
} from "@/src/types";

const users = new Map<string, SonoUserProfile>();
const patients = new Map<string, SonoPatient>();
const weeks = new Map<string, SonoWeek>();
const days = new Map<string, SonoDay>();

function nowIso() {
  return new Date().toISOString();
}

function weekIdFor(patientUid: string, startIso: IsoDate) {
  return `${patientUid}_${startIso}`;
}

function dayIdFor(weekId: string, dateIso: IsoDate) {
  return `${weekId}_${dateIso}`;
}

export function demoCreateProfile(params: {
  uid: string;
  email: string;
  displayName: string;
  role: SonoRole;
  clinicName?: string;
}): SonoUserProfile {
  const profile: SonoUserProfile = {
    uid: params.uid,
    email: params.email,
    displayName: params.displayName,
    role: params.role,
    clinicName: params.clinicName ?? (params.role === "professional" ? "Clínica Demo" : null),
    linkedProfessionalId: null,
    inviteCode:
      params.role === "professional" || params.role === "admin" ? "DEMO01" : null,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  users.set(params.uid, profile);

  if (params.role === "professional" || params.role === "admin") {
    seedDemoPatients(params.uid);
  }

  return profile;
}

/** Pacientes fictícios para a profissional ver a lista. */
function seedDemoPatients(professionalId: string) {
  const samples = [
    { uid: "demo-patient-1", name: "Ana Souza", email: "ana@demo.local" },
    { uid: "demo-patient-2", name: "Bruno Lima", email: "bruno@demo.local" },
    { uid: "demo-patient-3", name: "Carla Mendes", email: "carla@demo.local" },
    { uid: "demo-patient-4", name: "Diego Rocha", email: "diego@demo.local" },
    { uid: "demo-patient-5", name: "Elena Prado", email: "elena@demo.local" },
    { uid: "demo-patient-6", name: "Felipe Nunes", email: "felipe@demo.local" },
  ];
  for (const s of samples) {
    if (patients.has(s.uid)) continue;
    const p: SonoPatient = {
      patientUid: s.uid,
      professionalId,
      displayName: s.name,
      email: s.email,
      activeWeekId: null,
      filledDays: 0,
      expectedDays: 7,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    patients.set(s.uid, p);
    users.set(s.uid, {
      uid: s.uid,
      email: s.email,
      displayName: s.name,
      role: "patient",
      linkedProfessionalId: professionalId,
      inviteCode: null,
      termsVersion: TERMS_VERSION,
      termsAcceptedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  // Registros demo — só quem teve atividade aparece em Atualizações
  const seedDay = (
    patientUid: string,
    daysAgo: number,
    patch: Partial<ReturnType<typeof emptyDayInput>>
  ) => {
    try {
      const date = toIsoDate(addDays(new Date(), -daysAgo));
      const already = [...days.values()].some(
        (d) => d.patientUid === patientUid && d.date === date
      );
      if (already) return;
      const input = { ...emptyDayInput(date), ...patch, date };
      demoSaveDay({
        patientUid,
        professionalId,
        actorUid: professionalId,
        actorRole: "professional",
        input,
        entrySource: "manual",
      });
    } catch {
      // ignore
    }
  };

  seedDay("demo-patient-1", 1, {
    q0: "06:00",
    q1: "06:30",
    q2: "23:00",
    q3: "23:30",
    q4: 30,
    q5: 2,
    q6: [10, 15],
    q7: 360,
    q8: "nenhum",
    q9: "nenhum",
    qualityFeel: 7,
    qualityEnjoy: 6,
  });
  seedDay("demo-patient-3", 0, {
    q0: "07:10",
    q1: "07:25",
    q2: "22:40",
    q3: "23:00",
    q4: 20,
    q5: 1,
    q6: [12],
    q7: 390,
    q8: "nenhum",
    q9: "nenhum",
    qualityFeel: 8,
    qualityEnjoy: 7,
  });
  seedDay("demo-patient-5", 2, {
    q0: "05:50",
    q1: "06:20",
    q2: "22:15",
    q3: "22:45",
    q4: 45,
    q5: 3,
    q6: [8, 20, 10],
    q7: 330,
    q8: "1 taça de vinho",
    q9: "nenhum",
    qualityFeel: 5,
    qualityEnjoy: 4,
  });
}

export function demoGetUser(uid: string) {
  return users.get(uid) ?? null;
}

export function demoUpdateUser(uid: string, patch: Partial<SonoUserProfile>) {
  const cur = users.get(uid);
  if (!cur) return;
  users.set(uid, { ...cur, ...patch, updatedAt: nowIso() });
}

export function demoFindByInviteCode(code: string) {
  const upper = code.toUpperCase();
  for (const u of users.values()) {
    if (
      u.inviteCode === upper &&
      (u.role === "professional" || u.role === "admin")
    ) {
      return u;
    }
  }
  return null;
}

export function demoUpsertPatient(params: {
  patientUid: string;
  professionalId: string;
  displayName: string;
  email: string;
}) {
  const existing = patients.get(params.patientUid);
  const now = nowIso();
  if (existing) {
    patients.set(params.patientUid, {
      ...existing,
      ...params,
      updatedAt: now,
    });
    return;
  }
  patients.set(params.patientUid, {
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    displayName: params.displayName,
    email: params.email,
    activeWeekId: null,
    filledDays: 0,
    expectedDays: 7,
    createdAt: now,
    updatedAt: now,
  });
}

export function demoListPatients(professionalId: string) {
  seedDemoPatients(professionalId);
  return [...patients.values()]
    .filter((p) => p.professionalId === professionalId)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
}

export function demoGetPatient(patientUid: string) {
  return patients.get(patientUid) ?? null;
}

export function demoEnsureWeek(params: {
  patientUid: string;
  professionalId: string | null;
  around?: Date;
}): SonoWeek {
  const start = startOfWeekMonday(params.around ?? new Date());
  const startIso = toIsoDate(start);
  const weekId = weekIdFor(params.patientUid, startIso);
  const existing = weeks.get(weekId);
  if (existing) return existing;

  const week: SonoWeek = {
    weekId,
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startDate: startIso,
    endDate: toIsoDate(addDays(start, 6)),
    status: "open",
    filledDayIds: [],
    averages: null,
    ttsMode: "patient",
    source: "app",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  weeks.set(weekId, week);
  return week;
}

export function demoGetWeek(weekId: string) {
  return weeks.get(weekId) ?? null;
}

export function demoListDays(weekId: string) {
  return [...days.values()]
    .filter((d) => d.weekId === weekId)
    .sort((a, b) => a.dayIndex - b.dayIndex);
}

export function demoGetDay(dayId: string) {
  return days.get(dayId) ?? null;
}

export function demoSaveDay(params: {
  patientUid: string;
  professionalId: string | null;
  actorUid: string;
  actorRole: SonoRole;
  input: SleepDayInput;
  entrySource?: EntrySource;
}): SonoDay {
  const allowPast =
    params.actorRole === "professional" || params.actorRole === "admin";
  const gate = canSaveDay(params.input.date, new Date(), {
    allowPastByProfessional: allowPast,
  });
  if (!gate.ok) throw new Error(gate.reason);

  let week = demoEnsureWeek({
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    around: new Date(params.input.date + "T12:00:00"),
  });
  const dates = weekDateList(week.startDate);
  if (!dates.includes(params.input.date)) {
    week = demoEnsureWeek({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      around: new Date(params.input.date + "T12:00:00"),
    });
  }

  const metrics = computeDayMetrics(params.input);
  const dayId = dayIdFor(week.weekId, params.input.date);
  const existing = days.get(dayId);
  const now = nowIso();
  const entrySource: EntrySource =
    params.entrySource ??
    (params.actorUid === params.patientUid ? "manual" : "professional");

  const day: SonoDay = {
    dayId,
    weekId: week.weekId,
    patientUid: params.patientUid,
    dayIndex: dayIndexInWeek(week.startDate, params.input.date),
    date: params.input.date,
    input: params.input,
    metrics,
    entrySource,
    createdBy: existing?.createdBy ?? params.actorUid,
    updatedBy: params.actorUid,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  days.set(dayId, day);

  const all = demoListDays(week.weekId);
  const averages = computeWeekAverages(all, week.ttsMode as TtsMode);
  const filledDayIds = all.map((d) => d.dayId);
  weeks.set(week.weekId, {
    ...week,
    filledDayIds,
    averages,
    status: filledDayIds.length >= 7 ? "complete" : week.status,
    updatedAt: now,
  });

  const patient = patients.get(params.patientUid);
  if (patient) {
    patients.set(params.patientUid, {
      ...patient,
      activeWeekId: week.weekId,
      filledDays: filledDayIds.length,
      updatedAt: now,
    });
  }

  return day;
}

export function demoLinkByCode(params: {
  patientUid: string;
  patientName: string;
  patientEmail: string;
  inviteCode: string;
}): string {
  const pro = demoFindByInviteCode(params.inviteCode);
  if (!pro) {
    // No demo, aceita DEMO01 mesmo antes de criar profissional nesta sessão
    if (params.inviteCode.trim().toUpperCase() === "DEMO01") {
      const fakeProId = "demo-professional";
      if (!users.has(fakeProId)) {
        demoCreateProfile({
          uid: fakeProId,
          email: "pro@demo.local",
          displayName: "Dra. Demo",
          role: "professional",
          clinicName: "Clínica Demo",
        });
      }
      demoUpdateUser(params.patientUid, { linkedProfessionalId: fakeProId });
      demoUpsertPatient({
        patientUid: params.patientUid,
        professionalId: fakeProId,
        displayName: params.patientName,
        email: params.patientEmail,
      });
      return fakeProId;
    }
    throw new Error("Nenhuma profissional encontrada com este código.");
  }
  demoUpdateUser(params.patientUid, { linkedProfessionalId: pro.uid });
  demoUpsertPatient({
    patientUid: params.patientUid,
    professionalId: pro.uid,
    displayName: params.patientName,
    email: params.patientEmail,
  });
  return pro.uid;
}
