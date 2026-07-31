import { COLLECTIONS, TERMS_VERSION } from "@/src/constants/collections";
import {
  demoCreateProfile,
  demoGetUser,
  demoLinkByCode,
  demoUpdateUser,
} from "@/src/services/demoStore";
import { isDemoMode, requireDb } from "@/src/services/firebase.config";
import type { SonoRole, SonoUserProfile } from "@/src/types";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function fetchSonoUser(
  uid: string
): Promise<SonoUserProfile | null> {
  if (isDemoMode()) return demoGetUser(uid);
  const snap = await getDoc(doc(requireDb(), COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  return snap.data() as SonoUserProfile;
}

export async function createSonoUser(params: {
  uid: string;
  email: string;
  displayName: string;
  role: SonoRole;
  clinicName?: string;
}): Promise<SonoUserProfile> {
  if (isDemoMode()) {
    return demoCreateProfile(params);
  }

  const now = new Date().toISOString();
  const profile: SonoUserProfile = {
    uid: params.uid,
    email: params.email,
    displayName: params.displayName.trim() || "Usuário",
    role: params.role,
    clinicName:
      params.role === "professional" ? params.clinicName ?? null : null,
    linkedProfessionalId: null,
    inviteCode:
      params.role === "professional" || params.role === "admin"
        ? makeInviteCode()
        : null,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(requireDb(), COLLECTIONS.users, params.uid), {
    ...profile,
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });

  return profile;
}

export async function updateSonoUser(
  uid: string,
  patch: Partial<SonoUserProfile>
): Promise<void> {
  if (isDemoMode()) {
    demoUpdateUser(uid, patch);
    return;
  }
  await updateDoc(doc(requireDb(), COLLECTIONS.users, uid), {
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedAtServer: serverTimestamp(),
  });
}

export async function linkPatientToProfessionalByCode(params: {
  patientUid: string;
  patientName: string;
  patientEmail: string;
  inviteCode: string;
}): Promise<string> {
  if (isDemoMode()) {
    return demoLinkByCode(params);
  }

  const { findProfessionalByInviteCode, upsertSonoPatient } = await import(
    "@/src/services/patients"
  );
  const code = params.inviteCode.trim().toUpperCase();
  if (code.length < 4) throw new Error("Código inválido.");

  const pro = await findProfessionalByInviteCode(code);
  if (!pro) {
    throw new Error("Nenhuma profissional encontrada com este código.");
  }

  await updateSonoUser(params.patientUid, {
    linkedProfessionalId: pro.uid,
  });

  await upsertSonoPatient({
    patientUid: params.patientUid,
    professionalId: pro.uid,
    displayName: params.patientName,
    email: params.patientEmail,
  });

  return pro.uid;
}
