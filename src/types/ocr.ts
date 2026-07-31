import type { IsoDate, SleepDayInput } from "@/src/types";
import { emptyDayInput } from "@/src/types";

export type OcrJobStatus =
  | "pending"
  | "processing"
  | "needs_review"
  | "confirmed"
  | "failed";

export type OcrDraftDay = SleepDayInput & {
  dayIndex: number;
  confidence: number;
};

export interface OcrJob {
  jobId: string;
  patientUid: string;
  patientName: string;
  uploadedBy: string;
  imageUri: string;
  status: OcrJobStatus;
  draftDays: OcrDraftDay[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

/** Exemplo do PDF — usado no mock até ligarmos Gemini. */
export function mockExtractFromImage(
  imageUri: string,
  params: {
    patientUid: string;
    patientName: string;
    uploadedBy: string;
    baseDate?: IsoDate;
  }
): OcrJob {
  const now = new Date().toISOString();
  const base = params.baseDate ?? new Date().toISOString().slice(0, 10);

  const day1: OcrDraftDay = {
    ...emptyDayInput(base),
    dayIndex: 1,
    date: base,
    q0: "06:00",
    q1: "06:30",
    q2: "23:00",
    q3: "23:30",
    q4: 30,
    q5: 4,
    q6: [10, 30, 15, 5],
    q7: 360,
    q8: "1 taça de vinho",
    q9: "1 Stillnox",
    q10: "Tive febre",
    qualityFeel: 6,
    qualityEnjoy: 5,
    confidence: 0.82,
  };

  return {
    jobId: `ocr-${Date.now()}`,
    patientUid: params.patientUid,
    patientName: params.patientName,
    uploadedBy: params.uploadedBy,
    imageUri,
    status: "needs_review",
    draftDays: [day1],
    warnings: [
      "Leitura simulada (demo). A IA real entra depois.",
      "Revise os campos antes de confirmar.",
    ],
    createdAt: now,
    updatedAt: now,
  };
}
