import { COLLECTIONS } from "@/src/constants/collections";
import { computeDayMetrics, computeWeekAverages } from "@/src/domain/sleepMetrics";
import {
  addDays,
  canSaveDay,
  dayIndexInWeek,
  startOfWeekMonday,
  toIsoDate,
  weekDateList,
} from "@/src/domain/timeHelpers";
import {
  demoEnsureWeek,
  demoGetDay,
  demoGetWeek,
  demoListDays,
  demoSaveDay,
} from "@/src/services/demoStore";
import { isDemoMode, requireDb } from "@/src/services/firebase.config";
import type {
  EntrySource,
  IsoDate,
  SleepDayInput,
  SonoDay,
  SonoRole,
  SonoWeek,
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

export async function ensureActiveWeek(params: {
  patientUid: string;
  professionalId: string | null;
  around?: Date;
}): Promise<SonoWeek> {
  if (isDemoMode()) return demoEnsureWeek(params);

  const db = requireDb();
  const start = startOfWeekMonday(params.around ?? new Date());
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(addDays(start, 6));
  const weekId = weekIdFor(params.patientUid, startIso);
  const ref = doc(db, COLLECTIONS.weeks, weekId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as SonoWeek;
  }

  const now = new Date().toISOString();
  const week: SonoWeek = {
    weekId,
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    startDate: startIso,
    endDate: endIso,
    status: "open",
    filledDayIds: [],
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

  return week;
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
    return demoSaveDay({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      actorUid: params.actorUid,
      actorRole: params.actorRole,
      input: params.input,
      entrySource: params.entrySource,
    });
  }

  const allowPast =
    params.actorRole === "professional" || params.actorRole === "admin";
  const gate = canSaveDay(params.input.date, new Date(), {
    allowPastByProfessional: allowPast,
  });
  if (!gate.ok) {
    throw new Error(gate.reason);
  }

  const db = requireDb();
  const week =
    params.week ??
    (await ensureActiveWeek({
      patientUid: params.patientUid,
      professionalId: params.professionalId,
      around: new Date(params.input.date + "T12:00:00"),
    }));

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
  const status =
    filledDayIds.length >= 7 ? ("complete" as const) : targetWeek.status;

  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.days, dayId), {
    ...day,
    updatedAtServer: serverTimestamp(),
  });
  batch.set(
    doc(db, COLLECTIONS.weeks, targetWeek.weekId),
    {
      filledDayIds,
      averages,
      status,
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
