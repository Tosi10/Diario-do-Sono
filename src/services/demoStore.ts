/**
 * Modo demo — memória local, sem Firebase.
 * Ativo automaticamente quando não há .env configurado.
 * Seed personalizado para apresentação à Dra. Ana Gonçalves.
 */
import { TERMS_VERSION } from "@/src/constants/collections";
import { demoPersona } from "@/src/content/demoPersona";
import { nextCycleStatus } from "@/src/domain/cycleProtocol";
import { computeDayMetrics, computeWeekAverages } from "@/src/domain/sleepMetrics";
import {
  addDays,
  canSaveDay,
  dayIndexInWeek,
  parseIsoDate,
  startOfWeekMonday,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
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
  TimeHHmm,
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
  inviteCode?: string;
}): SonoUserProfile {
  const profile: SonoUserProfile = {
    uid: params.uid,
    email: params.email,
    displayName: params.displayName,
    role: params.role,
    clinicName:
      params.clinicName ??
      (params.role === "professional" || params.role === "admin"
        ? demoPersona.professional.clinicName
        : null),
    linkedProfessionalId: null,
    inviteCode:
      params.role === "professional" || params.role === "admin"
        ? (params.inviteCode ?? demoPersona.professional.inviteCode)
        : null,
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

/** Garante a profissional Ana no store (para vínculo do paciente demo). */
export function demoEnsureProfessional(): SonoUserProfile {
  const existing = users.get(demoPersona.professional.uid);
  if (existing) return existing;
  return demoCreateProfile({
    uid: demoPersona.professional.uid,
    email: demoPersona.professional.email,
    displayName: demoPersona.professional.displayName,
    role: "professional",
    clinicName: demoPersona.professional.clinicName,
    inviteCode: demoPersona.professional.inviteCode,
  });
}

type NightPatch = Partial<ReturnType<typeof emptyDayInput>>;

function night(patch: NightPatch = {}): NightPatch {
  return {
    q0: "06:30",
    q1: "07:00",
    q2: "23:00",
    q3: "23:20",
    q4: 25,
    q5: 1,
    q6: [15],
    q7: 380,
    q8: "nenhum",
    q9: "nenhum",
    qualityFeel: 7,
    qualityEnjoy: 6,
    ...patch,
  };
}

/** Grava dia de seed sem regra do meio-dia (só demonstração). */
function seedWriteDay(params: {
  patientUid: string;
  professionalId: string;
  date: IsoDate;
  patch: NightPatch;
}) {
  const already = [...days.values()].some(
    (d) => d.patientUid === params.patientUid && d.date === params.date
  );
  if (already) return;

  const input = { ...emptyDayInput(params.date), ...params.patch, date: params.date };
  const week = demoEnsureWeek({
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    around: new Date(params.date + "T12:00:00"),
  });
  const metrics = computeDayMetrics(input);
  const dayId = dayIdFor(week.weekId, params.date);
  const now = nowIso();
  const day: SonoDay = {
    dayId,
    weekId: week.weekId,
    patientUid: params.patientUid,
    dayIndex: dayIndexInWeek(week.startDate, params.date),
    date: params.date,
    input,
    metrics,
    entrySource: "professional",
    createdBy: params.professionalId,
    updatedBy: params.professionalId,
    createdAt: now,
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
    wakeTime: week.wakeTime ?? "07:00",
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
}

function seedDay(
  professionalId: string,
  patientUid: string,
  daysAgo: number,
  patch: NightPatch
) {
  const date = toIsoDate(addDays(new Date(), -daysAgo));
  seedWriteDay({ patientUid, professionalId, date, patch });
}

/** Ciclos anteriores (válido + falho) para o histórico — Sprint 9. */
function seedCycleArchive(
  professionalId: string,
  patientUid: string,
  opts?: { alsoRegisterPatient?: boolean }
) {
  if (opts?.alsoRegisterPatient && !patients.has(patientUid)) {
    const p: SonoPatient = {
      patientUid,
      professionalId,
      displayName: demoPersona.patient.displayName,
      email: demoPersona.patient.email,
      activeWeekId: null,
      filledDays: 0,
      expectedDays: 7,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    patients.set(patientUid, p);
    if (!users.has(patientUid)) {
      users.set(patientUid, {
        uid: patientUid,
        email: demoPersona.patient.email,
        displayName: demoPersona.patient.displayName,
        role: "patient",
        linkedProfessionalId: professionalId,
        inviteCode: null,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: nowIso(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
  }

  const thisMonday = startOfWeekMonday(new Date());
  const validStart = toIsoDate(addDays(thisMonday, -14));
  const failedStart = toIsoDate(addDays(thisMonday, -21));

  // Ciclo válido (há 2 semanas): 5 noites
  for (let i = 0; i < 5; i++) {
    const date = toIsoDate(addDays(parseIsoDate(validStart), i));
    seedWriteDay({
      patientUid,
      professionalId,
      date,
      patch: night({
        q7: 360 + i * 5,
        qualityFeel: 6 + (i % 2),
        qualityEnjoy: 6,
      }),
    });
  }
  const validWeek = weeks.get(weekIdFor(patientUid, validStart));
  if (validWeek) {
    const all = demoListDays(validWeek.weekId);
    weeks.set(validWeek.weekId, {
      ...validWeek,
      wakeTime: "07:00",
      status: "complete",
      filledDayIds: all.map((d) => d.dayId),
      missedDayIds: weekDateList(validStart).slice(5),
      averages: computeWeekAverages(all, "patient"),
      closedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  // Ciclo falho (há 3 semanas): 2 noites + 3 perdidos
  for (let i = 0; i < 2; i++) {
    const date = toIsoDate(addDays(parseIsoDate(failedStart), i));
    seedWriteDay({
      patientUid,
      professionalId,
      date,
      patch: night({ q7: 300, qualityFeel: 4, qualityEnjoy: 4 }),
    });
  }
  const failedWeek = weeks.get(weekIdFor(patientUid, failedStart));
  if (failedWeek) {
    const all = demoListDays(failedWeek.weekId);
    const missed = weekDateList(failedStart).slice(2, 5);
    weeks.set(failedWeek.weekId, {
      ...failedWeek,
      wakeTime: "06:30",
      status: "failed",
      filledDayIds: all.map((d) => d.dayId),
      missedDayIds: missed,
      averages: computeWeekAverages(all, "patient"),
      closedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}

/** Pacientes fictícios + semana rica para a apresentação. */
function seedDemoPatients(professionalId: string) {
  const samples = [
    { uid: "demo-patient-1", name: "Ana Souza", email: "ana.souza@mapadosono.demo" },
    { uid: "demo-patient-2", name: "Bruno Lima", email: "bruno@mapadosono.demo" },
    { uid: "demo-patient-3", name: "Carla Mendes", email: "carla@mapadosono.demo" },
    { uid: "demo-patient-4", name: "Diego Rocha", email: "diego@mapadosono.demo" },
    { uid: "demo-patient-5", name: "Elena Prado", email: "elena@mapadosono.demo" },
    { uid: "demo-patient-6", name: "Felipe Nunes", email: "felipe@mapadosono.demo" },
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

  // Elena — quase uma semana completa (show de métricas / aderência)
  const elenaNights: NightPatch[] = [
    night({
      q0: "05:50",
      q1: "06:20",
      q2: "22:15",
      q3: "22:45",
      q4: 45,
      q5: 3,
      q6: [8, 20, 10],
      q7: 330,
      q8: "1 taça de vinho",
      qualityFeel: 5,
      qualityEnjoy: 4,
    }),
    night({
      q0: "06:10",
      q1: "06:40",
      q4: 35,
      q5: 2,
      q6: [12, 18],
      q7: 350,
      qualityFeel: 6,
      qualityEnjoy: 5,
    }),
    night({
      q0: "06:00",
      q1: "06:25",
      q4: 20,
      q5: 1,
      q6: [10],
      q7: 390,
      qualityFeel: 7,
      qualityEnjoy: 7,
    }),
    night({
      q0: "06:40",
      q1: "07:05",
      q2: "23:30",
      q3: "23:50",
      q4: 40,
      q5: 2,
      q6: [15, 20],
      q7: 340,
      qualityFeel: 5,
      qualityEnjoy: 5,
    }),
    night({
      q0: "06:20",
      q1: "06:45",
      q4: 15,
      q5: 0,
      q6: [],
      q7: 410,
      qualityFeel: 8,
      qualityEnjoy: 8,
    }),
    night({
      q0: "06:05",
      q1: "06:30",
      q4: 30,
      q5: 1,
      q6: [25],
      q7: 370,
      qualityFeel: 6,
      qualityEnjoy: 6,
    }),
  ];
  elenaNights.forEach((patch, i) => {
    seedDay(professionalId, "demo-patient-5", i, patch);
  });

  seedCycleArchive(professionalId, "demo-patient-5");
  seedCycleArchive(professionalId, demoPersona.patient.uid, {
    alsoRegisterPatient: true,
  });

  // Carla — manhã de hoje (painel “hoje ok”)
  seedDay(
    professionalId,
    "demo-patient-3",
    0,
    night({
      q0: "07:10",
      q1: "07:25",
      q2: "22:40",
      q3: "23:00",
      q4: 20,
      q5: 1,
      q6: [12],
      q7: 390,
      qualityFeel: 8,
      qualityEnjoy: 7,
    })
  );

  // Ana Souza — ontem
  seedDay(
    professionalId,
    "demo-patient-1",
    1,
    night({
      q0: "06:00",
      q1: "06:30",
      q2: "23:00",
      q3: "23:30",
      q4: 30,
      q5: 2,
      q6: [10, 15],
      q7: 360,
      qualityFeel: 7,
      qualityEnjoy: 6,
    })
  );

  // Bruno — 3 dias atrás
  seedDay(
    professionalId,
    "demo-patient-2",
    3,
    night({
      q0: "08:00",
      q1: "08:20",
      q2: "00:30",
      q3: "01:00",
      q4: 50,
      q5: 2,
      q6: [20, 15],
      q7: 320,
      qualityFeel: 4,
      qualityEnjoy: 3,
    })
  );
}

/**
 * Histórico curto para Marina (paciente da demo) — dias passados só leitura.
 */
export function demoSeedSessionPatientHistory(params: {
  patientUid: string;
  professionalId: string;
}) {
  seedDay(
    params.professionalId,
    params.patientUid,
    1,
    night({
      q0: "06:45",
      q1: "07:10",
      q7: 370,
      qualityFeel: 7,
      qualityEnjoy: 6,
    })
  );
  seedDay(
    params.professionalId,
    params.patientUid,
    2,
    night({
      q0: "07:00",
      q1: "07:20",
      q4: 40,
      q5: 2,
      q6: [10, 20],
      q7: 340,
      qualityFeel: 5,
      qualityEnjoy: 5,
    })
  );
  seedDay(
    params.professionalId,
    params.patientUid,
    3,
    night({
      q0: "06:20",
      q1: "06:50",
      q7: 400,
      qualityFeel: 8,
      qualityEnjoy: 7,
    })
  );
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
  const upper = code.trim().toUpperCase();
  const aliases = demoPersona.professional.inviteAliases as readonly string[];
  for (const u of users.values()) {
    if (
      (u.role === "professional" || u.role === "admin") &&
      (u.inviteCode === upper ||
        (aliases.includes(upper) &&
          aliases.includes(u.inviteCode ?? "")))
    ) {
      return u;
    }
  }
  // MAPA01 / DEMO01 → Ana mesmo se ainda não estiver na sessão
  if (aliases.includes(upper)) {
    return demoEnsureProfessional();
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
  if (params.around) {
    const dateIso = toIsoDate(params.around);
    const containing = demoFindWeekContaining(params.patientUid, dateIso);
    if (containing) return containing;

    const start = startOfWeekMonday(params.around);
    const startIso = toIsoDate(start);
    const weekId = weekIdFor(params.patientUid, startIso);
    const existing = weeks.get(weekId);
    if (existing) return existing;
    return demoCreateWeek({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      startIso,
    });
  }

  const open = demoListWeeks(params.patientUid).find((w) => w.status === "open");
  if (open) return open;

  const start = startOfWeekMonday(new Date());
  const startIso = toIsoDate(start);
  const weekId = weekIdFor(params.patientUid, startIso);
  const existing = weeks.get(weekId);
  if (existing) return existing;

  return demoCreateWeek({
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startIso,
  });
}

function demoCreateWeek(params: {
  patientUid: string;
  professionalId: string | null;
  startIso: IsoDate;
}): SonoWeek {
  const start = parseIsoDate(params.startIso);
  const weekId = weekIdFor(params.patientUid, params.startIso);
  const week: SonoWeek = {
    weekId,
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startDate: params.startIso,
    endDate: toIsoDate(addDays(start, 6)),
    wakeTime: null,
    status: "open",
    filledDayIds: [],
    missedDayIds: [],
    averages: null,
    ttsMode: "patient",
    source: "app",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  weeks.set(weekId, week);

  const patient = patients.get(params.patientUid);
  if (patient) {
    patients.set(params.patientUid, {
      ...patient,
      activeWeekId: weekId,
      updatedAt: nowIso(),
    });
  }
  return week;
}

export function demoFindWeekContaining(
  patientUid: string,
  dateIso: IsoDate
): SonoWeek | null {
  for (const w of demoListWeeks(patientUid)) {
    if (weekDateList(w.startDate).includes(dateIso)) return w;
  }
  return null;
}

export function demoListWeeks(patientUid: string): SonoWeek[] {
  return [...weeks.values()]
    .filter((w) => w.patientUid === patientUid)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function demoStartNewCycle(params: {
  patientUid: string;
  professionalId: string | null;
}): SonoWeek {
  const open = demoListWeeks(params.patientUid).find((w) => w.status === "open");
  if (open) {
    throw new Error(
      "Já existe um ciclo em andamento. Encerre-o antes de começar outro."
    );
  }
  const startIso = toIsoDate(new Date());
  return demoCreateWeek({
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startIso,
  });
}

export function demoGetWeek(weekId: string) {
  return weeks.get(weekId) ?? null;
}

export function demoSetWeekWakeTime(params: {
  weekId: string;
  wakeTime: TimeHHmm;
}): SonoWeek {
  const week = weeks.get(params.weekId);
  if (!week) throw new Error("Ciclo não encontrado.");
  if (week.wakeTime) {
    throw new Error(
      "A hora de acordar deste ciclo já foi definida e não pode ser alterada."
    );
  }
  if (week.status !== "open") {
    throw new Error("Este ciclo já foi encerrado.");
  }
  const updated: SonoWeek = {
    ...week,
    wakeTime: params.wakeTime,
    updatedAt: nowIso(),
  };
  weeks.set(params.weekId, updated);
  return updated;
}

export function demoRefreshWeekLifecycle(weekId: string): SonoWeek {
  const week = weeks.get(weekId);
  if (!week) throw new Error("Ciclo não encontrado.");
  const all = demoListDays(weekId);
  const filledDates = all.map((d) => d.date);
  const next = nextCycleStatus(week, filledDates);
  const now = nowIso();
  const updated: SonoWeek = {
    ...week,
    filledDayIds: all.map((d) => d.dayId),
    missedDayIds: next.missedDayIds,
    status: next.status,
    closedAt:
      next.status === "complete" || next.status === "failed"
        ? week.closedAt ?? now
        : week.closedAt ?? null,
    updatedAt: now,
  };
  weeks.set(weekId, updated);
  return updated;
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

  let week = demoEnsureWeek({
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    around: new Date(params.input.date + "T12:00:00"),
  });
  week = demoRefreshWeekLifecycle(week.weekId);

  const gate = canSaveDay(params.input.date, new Date(), {
    allowPastByProfessional: allowPast,
    wakeTime: week.wakeTime,
    cycleClosed: week.status === "failed" || week.status === "complete",
  });
  if (!gate.ok) throw new Error(gate.reason);

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
  const filledDates = all.map((d) => d.date);
  const lifecycle = nextCycleStatus({ ...week, filledDayIds }, filledDates);

  weeks.set(week.weekId, {
    ...week,
    filledDayIds,
    missedDayIds: lifecycle.missedDayIds,
    averages,
    status: lifecycle.status,
    closedAt:
      lifecycle.status === "complete" || lifecycle.status === "failed"
        ? now
        : week.closedAt ?? null,
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
