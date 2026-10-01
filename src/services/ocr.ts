import { mockExtractFromImage, type OcrDraftDay, type OcrJob } from "@/src/types/ocr";
import { toIsoDate } from "@/src/domain/timeHelpers";
import { COLLECTIONS } from "@/src/constants/collections";
import app, { isDemoMode, requireDb, storage } from "@/src/services/firebase.config";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const jobs = new Map<string, OcrJob>();

export function listOcrJobs(): OcrJob[] {
  return [...jobs.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getOcrJob(jobId: string): OcrJob | null {
  return jobs.get(jobId) ?? null;
}

export function updateOcrJob(jobId: string, patch: Partial<OcrJob>): OcrJob {
  const cur = jobs.get(jobId);
  if (!cur) throw new Error("Job OCR não encontrado.");
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  jobs.set(jobId, next);
  return next;
}

/**
 * Extrai dados da foto.
 * Demo: mock com exemplo do PDF.
 * Produção: Cloud Function + Gemini (ainda não ligado).
 */
export async function extractDiaryFromImage(params: {
  imageUri: string;
  patientUid: string;
  patientName: string;
  uploadedBy: string;
  /** Dia-alvo (quando a doutora abre OCR de dentro de um dia). */
  targetDate?: string;
}): Promise<OcrJob> {
  // Simula latência de leitura
  await new Promise((r) => setTimeout(r, 900));

  const baseDate = params.targetDate ?? toIsoDate(new Date());

  if (!isDemoMode()) {
    if (!storage || !app) {
      throw new Error("Firebase Storage não está ligado.");
    }
    const jobId = `ocr-${Date.now()}`;
    const path = `sono/diary-photos/${params.patientUid}/${jobId}.jpg`;
    const file = await fetch(params.imageUri);
    const blob = await file.blob();
    const stored = ref(storage, path);
    await uploadBytes(stored, blob, { contentType: "image/jpeg" });
    const imageUrl = await getDownloadURL(stored);
    const extract = httpsCallable<
      { storagePath: string; targetDate?: string },
      {
        warnings?: string[];
        days?: OcrDraftDay[];
      }
    >(getFunctions(app, "southamerica-east1"), "sonoExtractDiaryFromImage");
    const result = await extract({
      storagePath: path,
      targetDate: params.targetDate,
    });
    const now = new Date().toISOString();
    const draftDays = (result.data.days ?? []).map((day, index) => ({
      ...day,
      dayIndex: day.dayIndex || index + 1,
      date: day.date || params.targetDate || baseDate,
      q6: day.q6 ?? [],
    }));
    const job: OcrJob = {
      jobId,
      patientUid: params.patientUid,
      patientName: params.patientName,
      uploadedBy: params.uploadedBy,
      imageUri: imageUrl,
      status: "needs_review",
      draftDays,
      warnings: [
        "Leitura da IA. Nada entra no diário até você confirmar.",
        ...(result.data.warnings ?? []),
      ],
      createdAt: now,
      updatedAt: now,
    };
    jobs.set(job.jobId, job);
    try {
      await setDoc(doc(requireDb(), COLLECTIONS.ocrJobs, jobId), {
        ...job,
        storagePath: path,
        createdAtServer: serverTimestamp(),
      });
    } catch {
      // A revisão desta sessão segue mesmo se a regra do job ainda não foi publicada.
    }
    return job;
  }

  const job = mockExtractFromImage(params.imageUri, {
    ...params,
    baseDate,
  });
  jobs.set(job.jobId, job);
  return job;
}
