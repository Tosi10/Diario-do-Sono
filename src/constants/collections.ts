export const COLLECTIONS = {
  users: "sonoUsers",
  patients: "sonoPatients",
  weeks: "sonoWeeks",
  days: "sonoDays",
  ocrJobs: "sonoOcrJobs",
  /** Documento `main`: UID da doutora dona do app. */
  clinic: "sonoClinic",
} as const;

/** Versão dos termos — subir quando o texto legal mudar */
export const TERMS_VERSION = "1.0.0";

/** Caixa que recebe os avisos enquanto a conta oficial da Dra. Ana não existe. */
export const CLINIC_NOTIFY_EMAIL = "admin@vision10.com.br";

/** Curitiba / Brasília — evita emulador em UTC bloquear o diário de manhã */
export const CLINIC_TIMEZONE = "America/Sao_Paulo";

/** Protocolo do ciclo (Sprint 8) — substitui o corte das 12h. */
export const CYCLE_DAYS = 7;
export const MIN_FILLED_DAYS = 5;
/** 7 − 5: no 3º dia perdido o ciclo já não pode ser válido. */
export const MAX_MISSED_DAYS = 3;
/** Push de lembrete: minutos após a hora de acordar (só se o dia ainda não foi salvo) */
export const FILL_OPEN_OFFSET_MIN = 10;
/** Push de aviso: minutos antes de fechar a janela */
export const FILL_CLOSE_WARNING_MIN = 10;
/** Janela do paciente: da hora de acordar até +5h (Brasília) */
export const FILL_WINDOW_MINUTES = 5 * 60;

export const QUALITY_MIN = 0;
export const QUALITY_MAX = 10;
