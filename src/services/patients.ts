import { COLLECTIONS } from "@/src/constants/collections";
import {
  demoFindByInviteCode,
  demoGetPatient,
  demoListPatients,
  demoUpsertPatient,
} from "@/src/services/demoStore";
import { isDemoMode, requireDb } from "@/src/services/firebase.config";
import type { SonoPatient, SonoUserProfile } from "@/src/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

export async function findProfessionalByInviteCode(
  code: string
): Promise<SonoUserProfile | null> {
  if (isDemoMode()) return demoFindByInviteCode(code);

  const q = query(
    collection(requireDb(), COLLECTIONS.users),
    where("inviteCode", "==", code.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const profile = snap.docs[0]!.data() as SonoUserProfile;
  if (profile.role !== "professional" && profile.role !== "admin") {
    return null;
  }
  return profile;
}

export async function upsertSonoPatient(params: {
  patientUid: string;
  professionalId: string;
  displayName: string;
  email: string;
}): Promise<void> {
  if (isDemoMode()) {
    demoUpsertPatient(params);
    return;
  }

  const ref = doc(requireDb(), COLLECTIONS.patients, params.patientUid);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  if (existing.exists()) {
    await setDoc(
      ref,
      {
        displayName: params.displayName,
        email: params.email,
        professionalId: params.professionalId,
        updatedAt: now,
        updatedAtServer: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  const patient: SonoPatient = {
    patientUid: params.patientUid,
    professionalId: params.professionalId,
    displayName: params.displayName,
    email: params.email,
    activeWeekId: null,
    filledDays: 0,
    expectedDays: 7,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, {
    ...patient,
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });
}

export async function listPatientsForProfessional(
  professionalId: string
): Promise<SonoPatient[]> {
  if (isDemoMode()) return demoListPatients(professionalId);

  const q = query(
    collection(requireDb(), COLLECTIONS.patients),
    where("professionalId", "==", professionalId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as SonoPatient)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
}

export async function getPatient(
  patientUid: string
): Promise<SonoPatient | null> {
  if (isDemoMode()) return demoGetPatient(patientUid);
  const snap = await getDoc(
    doc(requireDb(), COLLECTIONS.patients, patientUid)
  );
  if (!snap.exists()) return null;
  return snap.data() as SonoPatient;
}
