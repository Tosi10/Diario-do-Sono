# Firestore Model — Diário do Sono

Prefixo de coleções: **`sono*`**. Storage: **`sono/...`**. Projeto Firebase **dedicado** (não usar `users` do Coach'em / futeba).

---

## Coleções

### `sonoUsers/{uid}`

Perfil do Auth.

| Campo | Tipo | Notas |
|-------|------|-------|
| `uid` | string | = doc id |
| `email` | string | |
| `displayName` | string | |
| `role` | `'patient' \| 'professional' \| 'admin'` | |
| `clinicName` | string? | profissional |
| `linkedProfessionalId` | string \| null | paciente → profissional |
| `inviteCode` | string? | profissional: código de vínculo |
| `termsVersion` | string | LGPD / termos |
| `termsAcceptedAt` | timestamp | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `sonoPatients/{patientUid}`

Visão clínica denormalizada (opcional mas útil para lista da profissional — padrão Coach'em athletes).

| Campo | Tipo | Notas |
|-------|------|-------|
| `patientUid` | string | |
| `professionalId` | string | |
| `displayName` | string | |
| `activeWeekId` | string \| null | |
| `adherence` | { filledDays, expectedDays, rate } | cache |
| `createdAt` | timestamp | |

### `sonoWeeks/{weekId}`

Uma semana de diário (7 colunas).

| Campo | Tipo | Notas |
|-------|------|-------|
| `weekId` | string | auto ou `patientUid_YYYY-MM-DD` (segunda ou 1º dia) |
| `patientUid` | string | |
| `professionalId` | string \| null | |
| `startDate` | string ISO | 1º dia da semana clínica |
| `endDate` | string ISO | |
| `wakeTime` | `'HH:mm'` \| null | Travada no início do ciclo |
| `status` | `'open' \| 'complete' \| 'failed' \| 'reviewed'` | `failed` = impossível ≥5 dias |
| `filledDayIds` | string[] | |
| `missedDayIds` | string[] | Dias do ciclo sem registro no prazo |
| `averages` | SleepWeekAverages \| null | médias das métricas |
| `ttsMode` | `'patient' \| 'computed'` | preferência clínica |
| `source` | `'app' \| 'ocr' \| 'mixed'` | |
| `closedAt` | timestamp? | quando `complete` ou `failed` |
| `createdAt` / `updatedAt` | timestamp | |

Ciclos **não se apagam**. Paciente pode ter vários `sonoWeeks`; `sonoPatients.activeWeekId` aponta só para o aberto. Histórico = query por `patientUid` (completos **e** falhos).

### `sonoDays/{dayId}`

Uma coluna do PDF.

| Campo | Tipo | Notas |
|-------|------|-------|
| `dayId` | string | ex. `weekId_1` … `_7` ou `weekId_YYYY-MM-DD` |
| `weekId` | string | |
| `patientUid` | string | |
| `dayIndex` | 1..7 | |
| `date` | string ISO | manhã do preenchimento |
| `input` | SleepDayInput | ver FORMULARIO-DIARIO |
| `metrics` | SleepDayMetrics | calculado |
| `entrySource` | `'manual' \| 'ocr'` | |
| `ocrJobId` | string? | se veio de foto |
| `createdBy` | uid | |
| `updatedBy` | uid | |
| `createdAt` / `updatedAt` | timestamp | |

### `sonoOcrJobs/{jobId}`

Pipeline de foto → draft.

| Campo | Tipo | Notas |
|-------|------|-------|
| `jobId` | string | |
| `patientUid` | string | dono clínico do diário |
| `uploadedBy` | uid | paciente ou profissional |
| `storagePath` | string | |
| `status` | `'pending' \| 'processing' \| 'needs_review' \| 'confirmed' \| 'failed'` | |
| `rawModelJson` | object \| null | resposta Gemini |
| `draftDays` | SleepDayInput[] | 1..7 colunas detectadas |
| `error` | string? | |
| `confirmedDayIds` | string[] | após revisão |
| `createdAt` / `updatedAt` | timestamp | |

### `sonoInvites/{inviteId}` (opcional)

Convites por e-mail / código de uso único — se o fluxo de código em `sonoUsers.inviteCode` não bastar.

---

## Storage

```
sono/
  profiles/{uid}/avatar.jpg
  diary-photos/{patientUid}/{jobId}.jpg
```

Rules: upload autenticado; leitura só dono ou profissional vinculado.

---

## Índices compostos (previstos)

- `sonoWeeks`: `professionalId` + `status` + `updatedAt`
- `sonoWeeks`: `patientUid` + `startDate`
- `sonoDays`: `weekId` + `dayIndex`
- `sonoPatients`: `professionalId` + `displayName`
- `sonoOcrJobs`: `patientUid` + `status` + `createdAt`

---

## Regras (esboço)

```
match /sonoUsers/{uid} {
  allow read: if auth.uid == uid
    || (isProfessional() && getPatientLink(uid) == auth.uid);
  allow create, update: if auth.uid == uid;
}

match /sonoDays/{id} {
  allow read, write: if auth.uid == resource.data.patientUid
    || (isProfessional() && resource.data.patientUid in myPatients());
}
```

Implementação final com helpers `isProfessional()`, `isLinkedProfessional(patientUid)` — mesmo estilo Tiro/Coach-em.

---

## Constantes no app

```ts
// src/constants/collections.ts
export const COLLECTIONS = {
  users: 'sonoUsers',
  patients: 'sonoPatients',
  weeks: 'sonoWeeks',
  days: 'sonoDays',
  ocrJobs: 'sonoOcrJobs',
  invites: 'sonoInvites',
} as const;
```

**Nunca** escrever em `users`, `coachem*`, `tiro*`, `cora_ai_*`, etc.
