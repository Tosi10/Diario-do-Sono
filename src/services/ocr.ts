import { mockExtractFromImage, type OcrJob } from "@/src/types/ocr";
import { toIsoDate } from "@/src/domain/timeHelpers";
import { isDemoMode } from "@/src/services/firebase.config";

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
    // Placeholder até Functions: mesmo mock, marcado como demo parcial
    const job = mockExtractFromImage(params.imageUri, {
      ...params,
      baseDate,
    });
    job.warnings = [
      "Firebase ligado, mas OCR com IA ainda não está deployado.",
      "Usando leitura simulada — revise tudo.",
    ];
    jobs.set(job.jobId, job);
    return job;
  }

  const job = mockExtractFromImage(params.imageUri, {
    ...params,
    baseDate,
  });
  jobs.set(job.jobId, job);
  return job;
}
