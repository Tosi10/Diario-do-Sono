# Mapa do Sono — Roadmap & Sprints

Plano executável do zero até piloto clínico com a Dra. Ana Gonçalves e os primeiros pacientes.

**Produto:** Mapa do Sono (nome escolhido por ela).  
**Princípio:** simples como a folha · papel com OCR quando preciso · cálculos automáticos · identidade visual da clínica · Expo + NativeWind + Firebase.

Docs de suporte: [`README.md`](README.md) · [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) · [`docs/FORMULARIO-DIARIO.md`](docs/FORMULARIO-DIARIO.md) · [`docs/FIRESTORE-MODEL.md`](docs/FIRESTORE-MODEL.md) · [`docs/OCR-PIPELINE.md`](docs/OCR-PIPELINE.md) · [`docs/IDENTIDADE-VISUAL.md`](docs/IDENTIDADE-VISUAL.md) · [`docs/MAPA DO SONO.docx`](docs/MAPA%20DO%20SONO.docx)

---

## Status atual (ago/2026)

| Área | Situação |
|------|----------|
| Nome + copy oficial | **Feito** — texto dela no app (`src/content/mapaDoSono.ts`) |
| Identidade visual no app | **Feito** — Marfim/Terra/Argila/Oliva, Bodoni + Work Sans, selo |
| Landing Ana Gonçalves | **Feito** — site pessoal (fora do escopo do diário) |
| Sprints 1–3 (código) | **Feito** em modo demo (sem Firebase `.env`) |
| Sprint 4 métricas | **Parcial** — LIS…EF no app; validar com ela |
| Sprint 5 OCR | **Parcial** — UI + mock demo; Gemini/Storage pendente |
| Firebase real / piloto APK | **Pendente** |

**MVP clínico útil (form + painel + métricas)** ≈ pronto em demo.  
**Próximo bloqueio:** projeto Firebase + `.env` + validação das fórmulas com a Ana.

---

## Visão por fases

| Fase | Objetivo | Resultado |
|------|----------|-----------|
| **0** | Arquitetura + alinhamento | Docs, escopo e checklist com a profissional |
| **1** | Fundação | Scaffold Expo + Firebase + Auth + roles |
| **2** | Diário digital | Paciente preenche Q0–Q10 + qualidade (1 dia / semana) |
| **3** | Painel clínico | Profissional vê pacientes, grade e métricas |
| **4** | Cálculos | LIS…EF + médias; TTS paciente vs calculado |
| **5** | OCR | Foto da folha → revisão → gravação |
| **6** | Piloto clínico | APK + 2–3 pacientes reais + ajustes |
| **7** | Polish / loja | LGPD, App Check, branding clínica |

---

## Papéis (não esquecer)

- **Paciente:** preenche de manhã (só até 12:00 Brasília); vincula com o código dela.
- **Profissional (ela = admin da clínica):** vê pacientes, preenche no lugar deles, registra dias anteriores; hoje após 12h também bloqueado.
- **Admin técnico (você):** Firebase Console no piloto.

### Regra do meio-dia

`canSaveDay` / `isPastNoon` em `src/domain/timeHelpers.ts`: após **12:00 no fuso `America/Sao_Paulo`** (Brasília/Curitiba), o **dia de hoje** não pode ser gravado (paciente nem profissional). Dias passados: só a profissional.  
Isso evita emulador em UTC marcar “já passou do meio-dia” de manhã no Brasil.

---

## Sprint 0 — Planejamento `[FEITO]`

**Meta:** arquiteto fecha o plano; profissional valida o espelho do PDF.

- [x] Ler PDF Diário de Sono Padrão
- [x] Analisar arquitetura dos vizinhos (Coach-em, Tiro, Carol, EletroNovo, cora-ai, CooPs)
- [x] README + ARQUITETURA + FORMULARIO + FIRESTORE + OCR + este ROADMAP
- [x] Regra clínica: após 12:00 não grava o dia de hoje
- [x] Nome comercial: **Mapa do Sono** (escolha da Ana)
- [x] Copy de boas-vindas + guia Q0–Q10 (`docs/MAPA DO SONO.docx`)
- [x] Identidade visual oficial (`docs/IDENTIDADE-VISUAL.md` + PDF Ananda)
- [ ] Call / alinhamento com a psiquiatra (equações extras)
- [ ] Criar Firebase project id dedicado ao app (manual)

**Critério de pronto:** escopo MVP aprovado; Sprint 1 liberado. ✅

---

## Sprint 1 — Fundação (scaffold + Auth + roles) `[FEITO no código]`

**Meta:** app sobe; conta paciente e profissional entram e persistem.

- [x] Expo + Expo Router + TypeScript + NativeWind v4
- [x] Estrutura `app/`, `src/services|domain|types|components`
- [x] Firebase config + `.env.example`
- [x] `sonoUsers` (role: patient | professional | admin)
- [x] Login / cadastro / logout
- [x] Layouts `(auth)`, `(patient)`, `(professional)`
- [x] `firestore.rules` + `storage.rules` iniciais
- [x] Modo demo sem `.env` (fluxo completo em memória)
- [ ] Criar projeto Firebase real + preencher `.env` (manual)

**Critério de pronto:** profissional + paciente entram nas homes certas. ✅ (demo)

---

## Sprint 2 — Diário do paciente `[FEITO no código]`

- [x] Types + helpers de tempo
- [x] `sonoWeeks` / `sonoDays`
- [x] Tela Hoje: Q0–Q10 + escalas (labels do Mapa do Sono)
- [x] **Regra 12:00** (`canSaveDay`, fuso Brasília)
- [x] Tela Semana + progresso
- [x] Texto de boas-vindas no Início do paciente
- [ ] Teste com Firebase real

---

## Sprint 3 — Vínculo + painel da profissional `[FEITO no código]`

- [x] Código de convite (`inviteCode`)
- [x] Paciente vincula → `sonoPatients`
- [x] Lista de pacientes + aderência
- [x] Profissional preenche/edita dia do paciente
- [x] Dias passados liberados para ela; hoje após 12h bloqueado
- [x] Home profissional com atualizações (só quem tem registro real)
- [ ] Cloud Function criar paciente com senha provisória (depois)

---

## Sprint 4 — Cálculos clínicos `[PARCIAL]`

- [x] `sleepMetrics.ts`: LIS, FDN, TA, TTS, DPM, TTC, TTA, EF
- [x] Painel de métricas no app
- [ ] Validar fórmulas com o exemplo do PDF + ela
- [ ] Equações extras que ela passar
- [ ] Toggle TTS paciente vs calculado na UI

---

## Sprint 5 — OCR da folha manuscrita `[PARCIAL — UI + demo]`

**Meta:** foto → draft → revisão → mesmos `sonoDays` do app.

- [x] Fluxo profissional: foto / galeria → revisão
- [x] Upload câmera/galeria (`expo-image-picker`)
- [x] Tela de revisão (foto + campos editáveis + confirmar)
- [x] Mock de leitura (exemplo do PDF) no modo demo
- [ ] Upload real → Storage
- [ ] Function Gemini `sonoExtractDiaryFromImage`
- [ ] Persistência `sonoOcrJobs` no Firestore

---

## Sprint 6 — Piloto clínico fechado

**Meta:** uso real com a clínica, sem loja ainda.

- [ ] EAS project + `eas.json` (preview APK)
- [ ] Build Android instalável na conta dela + 2–3 pacientes
- [ ] Checklist de teste manual (manhã a manhã + OCR 1x)
- [x] Ajustes de copy / labels com o vocabulário dela (Mapa do Sono)
- [ ] Corrigir bugs bloqueadores do piloto
- [ ] Coletar feedback estruturado (o que ainda “parece app complicado?”)

**Critério de pronto:** 1 semana completa de ≥ 1 paciente real no app **ou** via OCR; ela usa o painel na consulta.

**Estimativa:** 1–2 semanas (calendário clínico).

---

## Sprint 7 — Polish, LGPD e valor de clínica `[PARCIAL — branding]`

**Meta:** base para continuidade / possível loja ou white-label.

- [x] Branding app: cores Terra/Marfim/Argila/Oliva, tipografia, selo, splash claro
- [x] Landing da marca pessoal (Ana Gonçalves) — separado do produto
- [ ] App Check
- [ ] Exportar / apagar dados (LGPD Functions)
- [ ] Notificação local “lembrete manhã” (opcional, 1 setting)
- [ ] PDF/relatório semanal para prontuário (opcional)
- [ ] Política de privacidade + termos finais
- [ ] Decisão: Play Store interna vs só APK clínica

**Critério de pronto:** checklist jurídico mínimo ok; app estável no piloto.

---

## Ordem de prioridade (resumo)

| Prioridade | Item | Status |
|------------|------|--------|
| P0 | Auth + formulário paciente = folha / Mapa do Sono | ✅ demo |
| P0 | Painel profissional + vínculo | ✅ demo |
| P0 | Cálculos LIS…EF | ✅ código / ⏳ validar com ela |
| P0 | Firebase real + `.env` | ⏳ |
| P1 | OCR com revisão (Gemini) | ⏳ UI pronta |
| P1 | Piloto APK | ⏳ |
| P2 | Relatório PDF / lembretes / loja | ⏳ |

---

## Timeline sugerida (calendário)

| Semana | Entrega | Status |
|--------|---------|--------|
| S0 | Docs + alinhamento + nome | ✅ (falta call equações) |
| S1 | Scaffold + Auth | ✅ |
| S2 | Form paciente | ✅ |
| S3 | Painel profissional | ✅ |
| S4 | Métricas | 🟡 parcial |
| S5–S6 | OCR | 🟡 UI/demo |
| — | Identidade + rename Mapa do Sono | ✅ |
| S7–S8 | Firebase + piloto APK + ajustes | ⏳ próximo |
| S9+ | Polish / LGPD | ⏳ |

**MVP clínico útil** ≈ fim do Sprint 4 (já dá para abandonar planilha) — **alcançado em demo**.  
**MVP completo (papel incluso)** ≈ fim do Sprint 5–6.

---

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Paciente achar “mais um app chato” | UI = 1 tela/dia; copy dela; zero features extras no MVP |
| TTC/TTS ambíguos no PDF | Validar fórmulas com ela no Sprint 4; testes no exemplo |
| OCR fraco em letra ruim | Revisão obrigatória; nunca auto-publicar |
| Dados sensíveis | Firebase próprio + rules + App Check |
| Emulador em UTC | Corte 12:00 em `America/Sao_Paulo` |
| Escopo crescer (chat, wearables…) | Backlog congelado até pós-piloto |

---

## Backlog pós-MVP (não agora)

- Multi-profissional / clínica SaaS (estilo CooPs `workspaceId`)
- Gráficos de tendência multi-semana
- Integração prontuário Carol-like
- Wearables
- i18n
- App web só leitura para consultório

---

## Próxima ação imediata

1. **Criar projeto Firebase** dedicado ao Mapa do Sono + `.env` e rodar com Auth real.
2. Cadastrar a profissional e 1 paciente de teste; validar vínculo + regra 12h (Brasília).
3. Call com a Ana: validar equações (Sprint 4) e qualquer ajuste fino de copy.
4. Depois: OCR real (Sprint 5) → build APK piloto (Sprint 6).
