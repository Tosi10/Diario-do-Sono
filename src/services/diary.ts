import { COLLECTIONS } from "@/src/constants/collections";
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
import {
  demoEnsureWeek,
  demoGetDay,
  demoGetWeek,
  demoListDays,
  demoListWeeks,
  demoRefreshWeekLifecycle,
  demoSaveDay,
  demoSetWeekWakeTime,
  demoStartNewCycle,
} from "@/src/services/demoStore";
import { isDemoMode, requireDb } from "@/src/services/firebase.config";
import type {
  EntrySource,
  IsoDate,
  SleepDayInput,
  SonoDay,
  SonoRole,
  SonoWeek,
  TimeHHmm,
  TtsMode,
} from "@/src/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

function weekIdFor(patientUid: string, startIso: IsoDate): string {
  return `${patientUid}_${startIso}`;
}

function dayIdFor(weekId: string, dateIso: IsoDate): string {
  return `${weekId}_${dateIso}`;
}

async function applyWeekLifecycle(week: SonoWeek): Promise<SonoWeek> {
  const all = await listDaysForWeek(week.weekId);
  const filledDates = all.map((d) => d.date);
  const next = nextCycleStatus(week, filledDates);
  if (
    next.status === week.status &&
    next.missedDayIds.length === (week.missedDayIds?.length ?? 0) &&
    next.missedDayIds.every((d, i) => d === week.missedDayIds?.[i])
  ) {
    return week;
  }

  const now = new Date().toISOString();
  const updated: SonoWeek = {
    ...week,
    status: next.status,
    missedDayIds: next.missedDayIds,
    closedAt:
      next.status === "complete" || next.status === "failed"
        ? week.closedAt ?? now
        : null,
    updatedAt: now,
  };

  await setDoc(
    doc(requireDb(), COLLECTIONS.weeks, week.weekId),
    {
      status: updated.status,
      missedDayIds: updated.missedDayIds,
      closedAt: updated.closedAt,
      updatedAt: now,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
  return updated;
}

export async function ensureActiveWeek(params: {
  patientUid: string;
  professionalId: string | null;
  around?: Date;
}): Promise<SonoWeek> {
  if (isDemoMode()) {
    const week = demoEnsureWeek(params);
    return demoRefreshWeekLifecycle(week.weekId);
  }

  const db = requireDb();

  if (!params.around) {
    const listed = await listWeeksForPatient(params.patientUid);
    const open = listed.find((w) => w.status === "open");
    if (open) return applyWeekLifecycle(open);
  }

  const start = startOfWeekMonday(params.around ?? new Date());
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(addDays(start, 6));
  const weekId = weekIdFor(params.patientUid, startIso);
  const ref = doc(db, COLLECTIONS.weeks, weekId);
  const snap = await getDoc(ref);

  let week: SonoWeek;
  if (snap.exists()) {
    week = snap.data() as SonoWeek;
  } else {
    const now = new Date().toISOString();
    week = {
      weekId,
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      startDate: startIso,
      endDate: endIso,
      wakeTime: null,
      status: "open",
      filledDayIds: [],
      missedDayIds: [],
      averages: null,
      ttsMode: "patient",
      source: "app",
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, {
      ...week,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });
  }

  return applyWeekLifecycle(week);
}

export async function listWeeksForPatient(
  patientUid: string
): Promise<SonoWeek[]> {
  if (isDemoMode()) return demoListWeeks(patientUid);

  const q = query(
    collection(requireDb(), COLLECTIONS.weeks),
    where("patientUid", "==", patientUid)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as SonoWeek)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function startNewCycle(params: {
  patientUid: string;
  professionalId: string | null;
}): Promise<SonoWeek> {
  if (isDemoMode()) return demoStartNewCycle(params);

  const listed = await listWeeksForPatient(params.patientUid);
  if (listed.some((w) => w.status === "open")) {
    throw new Error(
      "Já existe um ciclo em andamento. Encerre-o antes de começar outro."
    );
  }

  const startIso = toIsoDate(new Date());
  const endIso = toIsoDate(addDays(parseIsoDate(startIso), 6));
  const weekId = weekIdFor(params.patientUid, startIso);
  const now = new Date().toISOString();
  const week: SonoWeek = {
    weekId,
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startDate: startIso,
    endDate: endIso,
    wakeTime: null,
    status: "open",
    filledDayIds: [],
    missedDayIds: [],
    averages: null,
    ttsMode: "patient",
    source: "app",
    createdAt: now,
    updatedAt: now,
  };

  const db = requireDb();
  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.weeks, weekId), {
    ...week,
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });
  batch.set(
    doc(db, COLLECTIONS.patients, params.patientUid),
    {
      activeWeekId: weekId,
      filledDays: 0,
      expectedDays: 7,
      updatedAt: now,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
  return week;
}

export async function setWeekWakeTime(params: {
  weekId: string;
  wakeTime: TimeHHmm;
}): Promise<SonoWeek> {
  if (isDemoMode()) {
    const updated = demoSetWeekWakeTime(params);
    try {
      const { scheduleCycleNotifications } = await import(
        "@/src/services/notifications"
      );
      await scheduleCycleNotifications(updated);
    } catch {
      // Push opcional no Expo Go / web
    }
    return updated;
  }

  const ref = doc(requireDb(), COLLECTIONS.weeks, params.weekId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Ciclo não encontrado.");
  const week = snap.data() as SonoWeek;
  if (week.wakeTime) {
    throw new Error(
      "A hora de acordar deste ciclo já foi definida e não pode ser alterada."
    );
  }
  if (week.status !== "open") {
    throw new Error("Este ciclo já foi encerrado.");
  }

  const now = new Date().toISOString();
  await setDoc(
    ref,
    {
      wakeTime: params.wakeTime,
      updatedAt: now,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
  const updated = { ...week, wakeTime: params.wakeTime, updatedAt: now };
  try {
    const { scheduleCycleNotifications } = await import(
      "@/src/services/notifications"
    );
    await scheduleCycleNotifications(updated);
  } catch {
    // ignore
  }
  return updated;
}

export async function getWeek(weekId: string): Promise<SonoWeek | null> {
  if (isDemoMode()) return demoGetWeek(weekId);
  const snap = await getDoc(doc(requireDb(), COLLECTIONS.weeks, weekId));
  if (!snap.exists()) return null;
  return snap.data() as SonoWeek;
}

export async function listDaysForWeek(weekId: string): Promise<SonoDay[]> {
  if (isDemoMode()) return demoListDays(weekId);

  const q = query(
    collection(requireDb(), COLLECTIONS.days),
    where("weekId", "==", weekId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as SonoDay)
    .sort((a, b) => a.dayIndex - b.dayIndex);
}

export async function getDay(dayId: string): Promise<SonoDay | null> {
  if (isDemoMode()) return demoGetDay(dayId);
  const snap = await getDoc(doc(requireDb(), COLLECTIONS.days, dayId));
  if (!snap.exists()) return null;
  return snap.data() as SonoDay;
}

export async function saveDayEntry(params: {
  patientUid: string;
  professionalId: string | null;
  actorUid: string;
  actorRole: SonoRole;
  input: SleepDayInput;
  entrySource?: EntrySource;
  week?: SonoWeek;
}): Promise<SonoDay> {
  if (isDemoMode()) {
    const saved = await demoSaveDay({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      actorUid: params.actorUid,
      actorRole: params.actorRole,
      input: params.input,
      entrySource: params.entrySource,
    });
    try {
      const week = demoGetWeek(saved.weekId);
      if (week) {
        const { rescheduleAfterDaySaved } = await import(
          "@/src/services/notifications"
        );
        await rescheduleAfterDaySaved(week);
      }
    } catch {
      // ignore
    }
    return saved;
  }

  const allowPast =
    params.actorRole === "professional" || params.actorRole === "admin";
  const week =
    params.week ??
    (await ensureActiveWeek({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      around: new Date(params.input.date + "T12:00:00"),
    }));

  const gate = canSaveDay(params.input.date, new Date(), {
    allowPastByProfessional: allowPast,
    wakeTime: week.wakeTime,
    cycleClosed: week.status === "failed" || week.status === "complete",
  });
  if (!gate.ok) {
    throw new Error(gate.reason);
  }

  const db = requireDb();
  const dates = weekDateList(week.startDate);
  let targetWeek = week;
  if (!dates.includes(params.input.date)) {
    targetWeek = await ensureActiveWeek({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      around: new Date(params.input.date + "T12:00:00"),
    });
  }

  const metrics = computeDayMetrics(params.input);
  const dayIndex = dayIndexInWeek(targetWeek.startDate, params.input.date);
  const dayId = dayIdFor(targetWeek.weekId, params.input.date);
  const now = new Date().toISOString();
  const existing = await getDay(dayId);

  const entrySource: EntrySource =
    params.entrySource ??
    (params.actorUid === params.patientUid ? "manual" : "professional");

  const day: SonoDay = {
    dayId,
    weekId: targetWeek.weekId,
    patientUid: params.patientUid,
    dayIndex,
    date: params.input.date,
    input: params.input,
    metrics,
    entrySource,
    createdBy: existing?.createdBy ?? params.actorUid,
    updatedBy: params.actorUid,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const days = await listDaysForWeek(targetWeek.weekId);
  const others = days.filter((d) => d.dayId !== dayId);
  const all = [...others, day];
  const averages = computeWeekAverages(all, targetWeek.ttsMode);
  const filledDayIds = all.map((d) => d.dayId);
  const filledDates = all.map((d) => d.date);
  const lifecycle = nextCycleStatus(
    { ...targetWeek, filledDayIds },
    filledDates
  );

  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.days, dayId), {
    ...day,
    updatedAtServer: serverTimestamp(),
  });
  batch.set(
    doc(db, COLLECTIONS.weeks, targetWeek.weekId),
    {
      filledDayIds,
      missedDayIds: lifecycle.missedDayIds,
      averages,
      status: lifecycle.status,
      closedAt:
        lifecycle.status === "complete" || lifecycle.status === "failed"
          ? now
          : null,
      updatedAt: now,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    doc(db, COLLECTIONS.patients, params.patientUid),
    {
      activeWeekId: targetWeek.weekId,
      filledDays: filledDayIds.length,
      expectedDays: 7,
      updatedAt: now,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
  return day;
}

export async function setWeekTtsMode(
  weekId: string,
  ttsMode: TtsMode
): Promise<void> {
  if (isDemoMode()) return;
  const weekSnap = await getDoc(doc(requireDb(), COLLECTIONS.weeks, weekId));
  if (!weekSnap.exists()) throw new Error("Semana não encontrada.");
  const days = await listDaysForWeek(weekId);
  const averages = computeWeekAverages(days, ttsMode);
  await setDoc(
    doc(requireDb(), COLLECTIONS.weeks, weekId),
    {
      ttsMode,
      averages,
      updatedAt: new Date().toISOString(),
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}
