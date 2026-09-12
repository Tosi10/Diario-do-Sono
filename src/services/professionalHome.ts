import {
  ensureActiveWeek,
  listDaysForWeek,
} from "@/src/services/diary";
import {
  countPendingApprovals,
  listPatientsForProfessional,
} from "@/src/services/patients";
import { toIsoDate } from "@/src/domain/timeHelpers";
import type { SonoDay, SonoPatient } from "@/src/types";

export type PatientUpdateCard = {
  patient: SonoPatient;
  filledDays: number;
  expectedDays: number;
  filledToday: boolean;
  lastDay: SonoDay | null;
};

export type ProfessionalHomeData = {
  totalPatients: number;
  filledToday: number;
  pendingToday: number;
  /** Pedidos de vínculo aguardando aprovação. */
  pendingApprovals: number;
  updates: PatientUpdateCard[];
};

export async function getProfessionalHomeData(
  professionalId: string
): Promise<ProfessionalHomeData> {
  const [patients, pendingApprovals] = await Promise.all([
    listPatientsForProfessional(professionalId),
    countPendingApprovals(professionalId),
  ]);
  const today = toIsoDate(new Date());
  const updates: PatientUpdateCard[] = [];

  for (const patient of patients) {
    const week = await ensureActiveWeek({
      patientUid: patient.patientUid,
      professionalId,
    });
    const days = await listDaysForWeek(week.weekId);
    const sorted = [...days].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
    updates.push({
      patient,
      filledDays: days.length,
      expectedDays: patient.expectedDays || 7,
      filledToday: days.some((d) => d.date === today),
      lastDay: sorted[0] ?? null,
    });
  }

  updates.sort((a, b) => {
    const aTime = a.lastDay?.updatedAt ?? "";
    const bTime = b.lastDay?.updatedAt ?? "";
    return bTime.localeCompare(aTime);
  });

  const filledToday = updates.filter((u) => u.filledToday).length;
  const recentUpdates = updates.filter((u) => u.lastDay !== null);

  return {
    totalPatients: patients.length,
    filledToday,
    pendingToday: Math.max(0, patients.length - filledToday),
    pendingApprovals,
    updates: recentUpdates,
  };
}
