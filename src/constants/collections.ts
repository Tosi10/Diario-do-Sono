export const COLLECTIONS = {
  users: "sonoUsers",
  patients: "sonoPatients",
  weeks: "sonoWeeks",
  days: "sonoDays",
  ocrJobs: "sonoOcrJobs",
} as const;

/** Versão dos termos — subir quando o texto legal mudar */
export const TERMS_VERSION = "1.0.0";

/** Após este horário local, não se pode mais gravar o dia de hoje */
export const DIARY_CUTOFF_HOUR = 12;

export const QUALITY_MIN = 0;
export const QUALITY_MAX = 10;
