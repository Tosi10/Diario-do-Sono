# Arquitetura — Diário do Sono

Documento de arquitetura de software. Espelha decisões já consolidadas em Coach'em, Tiro, Carol, EletroNovo e cora-ai, adaptadas a um produto **clínico de sono**.

---

## 1. Visão do sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     App Expo (paciente + profissional)       │
│  Expo Router · NativeWind · TypeScript · Firebase JS SDK     │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
        Firebase Auth              Firestore (`sono*`)
                │                             │
                ▼                             ▼
        Storage (`sono/...`)      Cloud Functions (OCR, vínculo,
                                  cálculos server-side opcionais)
                │                             │
                └──────────► Gemini / Vision (só no backend)
```

**Dois papéis no mesmo app** (padrão Coach'em):

| Papel | `role` | Responsabilidade |
|-------|--------|------------------|
| Paciente | `patient` | Preencher diário diário; opcionalmente enviar foto da folha |
| Profissional | `professional` | Gerir pacientes, revisar OCR, ver métricas e médias da semana |
| Admin (piloto) | `admin` | Liberar contas, suporte interno |

---

## 2. Decisões de arquitetura (ADRs leves)

### ADR-01 — Firebase próprio (não compartilhar `futeba-96395`)

**Decisão:** criar projeto Firebase dedicado (ex.: `diario-do-sono` / `sono-clinica`).

**Por quê:** dados de saúde mental / sono são sensíveis (LGPD). Carol e EletroNovo já usam projeto próprio por esse motivo. Coach'em/Tiro compartilham `futeba` com prefixo, mas são menos clínicos.

**Consequência:** `firebase.json`, `firestore.rules` e `functions/` **dentro** de `DiarioDoSono/` (como EletroNovo / CooPs / Carol), não no root `NativeReact/`.

### ADR-02 — Formulário = PDF, nada a mais no MVP

**Decisão:** campos do app = exatamente Q0–Q10 + 2 escalas de qualidade + data. Sem questionários extras, sem tipagens de humor além do PDF.

**Por quê:** resistência dos pacientes a apps “cheios”. Diferencial = simplicidade do método dela.

### ADR-03 — Cálculos no client + espelho no doc (auditável)

**Decisão:** funções puras TypeScript (`src/domain/sleepMetrics.ts`) calculam LIS, FDN, TA, TTS, DPM, TTC, TTA, EF. Resultado salvo no documento do dia / agregado da semana.

**Por quê:** profissional precisa confiar e auditar; Orto usa o princípio “frontend guia, backend valida”. Aqui: client calcula na UX; opcionalmente Cloud Function recalcula na revisão clínica.

### ADR-04 — OCR sempre com revisão humana

**Decisão:** foto → Storage → Cloud Function (Gemini multimodal) → JSON estruturado → tela de **revisão** → só então grava como entrada oficial.

**Por quê:** mesmo com números, manuscrito erra. Precedente: EletroNovo `generateLaudoDraftV6` (imagem → JSON, médico revisa).

### ADR-05 — Vínculo paciente ↔ profissional via código / convite

**Decisão:** profissional gera código (ex.: 6 chars) ou convite por e-mail; paciente entra e fica `linkedProfessionalId`. Padrão Coach'em (código + CF).

### ADR-06 — Semana como unidade clínica

**Decisão:** modelo centrado em **SleepWeek** (7 noites) + **SleepDay** (1 coluna). Espelha o PDF (“sete noites / uma semana”).

---

## 3. Stack (espelho da casa)

| Camada | Tecnologia | Referência |
|--------|------------|------------|
| App | Expo SDK 54+ · Expo Router · TypeScript | Coach-em / Carol |
| UI | NativeWind v4 · `global.css` · Tailwind | todos |
| Auth | Firebase Auth + AsyncStorage persistence | Coach-em |
| DB | Firestore prefixo `sono*` | Tiro / cora-ai |
| Files | Storage `sono/diary-photos/...` | Carol docs |
| Backend | Cloud Functions (`us-central1`) | Carol / EletroNovo |
| IA | Gemini (callable) para OCR | EletroNovo vision |
| Build | EAS (`eas.json`) | Tiro / Coach-em |

---

## 4. Estrutura de pastas alvo

```
DiarioDoSono/
  app/
    (auth)/          # login, cadastro, aceite termos
    (patient)/       # tabs do paciente
    (professional)/  # tabs da profissional
    _layout.tsx
  src/
    services/        # firebase.config, auth, weeks, days, ocr, patients
    domain/          # sleepMetrics, timeHelpers, validations
    types/           # SleepDay, SleepWeek, SonoUser, OcrDraft
    components/      # DayForm, WeekGrid, MetricCard, OcrReview
    hooks/
    context/         # AuthContext / Session
    constants/       # collection names, termsVersion
  functions/         # OCR, invite, (opcional) recompute metrics
  docs/              # este pacote
  assets/
  global.css
  tailwind.config.js
  babel.config.js
  metro.config.js
  app.json
  eas.json
  firebase.json
  firestore.rules
  storage.rules
  .env.example
  package.json
  README.md
  ROADMAP.md
```

Padrão idêntico ao scaffold Coach-em / Tiro / cora-ai.

---

## 5. Fluxos principais

### 5.0 Regra do meio-dia

Após **12:00** horário local, ninguém grava o **dia de hoje** (`canSaveDay`).  
Profissional pode gravar **dias anteriores** (consulta / folha). Paciente só preenche **hoje** e só antes do meio-dia.

### 5.1 Paciente — preencher manhã

1. Abre app → vê “Hoje” (coluna do dia da semana ativa).
2. Preenche Q0–Q10 + 2 escalas (time pickers + números + texto curto).
3. Salva → `sonoDays/{id}` + atualiza progresso da `sonoWeeks/{id}`.
4. Métricas do dia calculadas e guardadas (mesmo que a profissional veja médias no fim).

### 5.2 Profissional — acompanhar e preencher

1. Lista pacientes vinculados + status da semana (X/7 dias).
2. Abre semana → grade tipo PDF + painel de métricas.
3. Se o paciente não usar o app, ela abre o dia e **preenche por ele** (`entrySource: professional`).
4. Pode editar/corrigir (auditoria: `updatedBy`, `updatedAt`).

### 5.3 OCR — folha manuscrita

1. Upload foto (paciente ou profissional).
2. Function `sonoExtractDiaryFromImage` → draft em `sonoOcrJobs/{id}`.
3. Tela de revisão lado a lado (foto + campos).
4. Confirmar → cria/atualiza `sonoDays` da semana correspondente.

Detalhe em [`OCR-PIPELINE.md`](OCR-PIPELINE.md).

---

## 6. Segurança e LGPD

- Projeto Firebase dedicado; App Check antes de produção.
- Rules: paciente só lê/escreve os próprios dias; profissional só pacientes com `linkedProfessionalId == auth.uid`.
- Termos + política versionados (`termsVersion`), como Tiro.
- Exportar / apagar conta (Cloud Function) no roadmap pós-MVP.
- Fotos de diário: retenção definida com a clínica; path privado no Storage.
- Segredos Gemini **nunca** no client.

---

## 7. O que fica fora do MVP

- Wearables / Apple Saúde
- Chat paciente–profissional
- Teleconsulta
- Multi-clínica / white-label SaaS (pode virar Fase SaaS depois, estilo CooPs)
- App separado só para profissional (mesmo binário, roles)
- i18n (PT-BR suficiente no piloto)

---

## 8. Critérios de qualidade clínica

Inspirado no Orto (“confiável para laudo”):

1. Toda métrica tem fórmula documentada em [`FORMULARIO-DIARIO.md`](FORMULARIO-DIARIO.md).
2. TTS pode vir da Q7 **ou** ser recalculado `TTC − (LIS + TA)` — flag `ttsSource: 'patient' | 'computed'`.
3. OCR nunca publica sem confirmação humana.
4. Mudança em dia já “fechado” fica auditável.

---

## 9. Alinhamento com a contratante (antes do Sprint 1)

Checklist para validar com a psiquiatra:

- [ ] Confirmar se TTC usa intervalo Q2→Q1 cruzando meia-noite (interpretação clínica padrão)
- [ ] Preferência: TTS reportado (Q7) vs TTS calculado
- [ ] Quais campos do OCR ela quer obrigatórios vs opcionais
- [ ] Quem sobe a foto: só ela, só paciente, ou ambos
- [ ] Entregar as equações extras (além das 8 do PDF) para o Sprint de métricas
- [ ] Nome comercial do app / logo clínica
