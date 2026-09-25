import { COLLECTIONS } from "@/src/constants/collections";
import {
  demoApprovePatient,
  demoBlockPatient,
  demoCountPendingApprovals,
  demoFindByInviteCode,
  demoGetPatient,
  demoListBlockedPatients,
  demoListPatients,
  demoListPendingPatients,
  demoRejectPatient,
  demoRemovePatient,
  demoUnblockPatient,
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
    status: "active",
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
    .filter((p) => (p.status ?? "active") === "active")
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
}

export async function listPendingPatientsForProfessional(
  professionalId: string
): Promise<SonoPatient[]> {
  if (isDemoMode()) return demoListPendingPatients(professionalId);
  // Firebase: Sprint 11
  return [];
}

export async function listBlockedPatientsForProfessional(
  professionalId: string
): Promise<SonoPatient[]> {
  if (isDemoMode()) return demoListBlockedPatients(professionalId);
  return [];
}

export async function countPendingApprovals(
  professionalId: string
): Promise<number> {
  if (isDemoMode()) return demoCountPendingApprovals(professionalId);
  return 0;
}

export async function approvePatient(patientUid: string): Promise<void> {
  if (isDemoMode()) {
    demoApprovePatient(patientUid);
    return;
  }
  throw new Error("Aprovação exige Firebase (Sprint 11).");
}

export async function rejectPatient(patientUid: string): Promise<void> {
  if (isDemoMode()) {
    demoRejectPatient(patientUid);
    return;
  }
  throw new Error("Recusa exige Firebase (Sprint 11).");
}

export async function blockPatient(patientUid: string): Promise<void> {
  if (isDemoMode()) {
    demoBlockPatient(patientUid);
    return;
  }
  throw new Error("Bloqueio exige Firebase (Sprint 11).");
}

export async function unblockPatient(patientUid: string): Promise<void> {
  if (isDemoMode()) {
    demoUnblockPatient(patientUid);
    return;
  }
  throw new Error("Desbloqueio exige Firebase (Sprint 11).");
}

export async function removePatientFromClinic(
  patientUid: string
): Promise<void> {
  if (isDemoMode()) {
    demoRemovePatient(patientUid);
    return;
  }
  throw new Error("Remoção exige Firebase (Sprint 11).");
}

/** Prontuário criado pela doutora. Pode não ter conta no app (folha de papel). */
export async function addPatientByProfessional(params: {
  professionalId: string;
  displayName: string;
  email?: string;
}): Promise<SonoPatient> {
  const displayName = params.displayName.trim();
  if (displayName.length < 2) {
    throw new Error("Informe o nome da paciente.");
  }
  const email = (params.email ?? "").trim().toLowerCase();
  if (email && !email.includes("@")) {
    throw new Error("E-mail inválido.");
  }

  if (isDemoMode()) {
    const patientUid = `chart-${Date.now()}`;
    demoUpsertPatient({
      patientUid,
      professionalId: params.professionalId,
      displayName,
      email,
      status: "active",
    });
    const created = demoGetPatient(patientUid);
    if (!created) throw new Error("Não foi possível criar a paciente.");
    return created;
  }

  const db = requireDb();
  const listed = await getDocs(
    query(
      collection(db, COLLECTIONS.patients),
      where("professionalId", "==", params.professionalId)
    )
  );
  if (
    email &&
    listed.docs.some((d) => (d.data().email ?? "").toLowerCase() === email)
  ) {
    throw new Error("Já existe uma paciente com este e-mail.");
  }

  const ref = doc(collection(db, COLLECTIONS.patients));
  const now = new Date().toISOString();
  const patient: SonoPatient = {
    patientUid: ref.id,
    professionalId: params.professionalId,
    displayName,
    email,
    status: "active",
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
  return patient;
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
