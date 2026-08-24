# Sono à Vista — Roadmap & Sprints

Plano executável do zero até piloto clínico com a Dra. Ana Gonçalves e os primeiros pacientes.

**Produto:** **Sono à Vista** (renomeado: “Mapa do Sono” já existia no mercado).  
**Princípio:** simples como a folha · papel com OCR quando preciso · cálculos automáticos · identidade visual da clínica · Expo + NativeWind + Firebase.

Docs de suporte: [`README.md`](README.md) · [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) · [`docs/FORMULARIO-DIARIO.md`](docs/FORMULARIO-DIARIO.md) · [`docs/FIRESTORE-MODEL.md`](docs/FIRESTORE-MODEL.md) · [`docs/OCR-PIPELINE.md`](docs/OCR-PIPELINE.md) · [`docs/IDENTIDADE-VISUAL.md`](docs/IDENTIDADE-VISUAL.md) · [`docs/MAPA DO SONO.docx`](docs/MAPA%20DO%20SONO.docx)

---

## Status atual (ago/2026)

| Área | Situação |
|------|----------|
| Nome + copy oficial | **Feito** — Sono à Vista (`src/content/mapaDoSono.ts`) |
| Identidade visual no app | **Feito** — Marfim/Terra/Argila/Oliva, Bodoni + Work Sans, selo |
| Landing Ana Gonçalves | **Em revisão** — textos do doc; site em manutenção até ela aprovar |
| Sprints 1–3 (código) | **Feito** em modo demo (sem Firebase `.env`) |
| Sprint 4 métricas | **Parcial** — LIS…EF no app; validar com ela |
| Sprint 5 OCR | **Parcial** — UI + mock demo; Gemini/Storage pendente |
| Protocolo de ciclo (hora de acordar + 5h + push) | **Sprints 8–10 feitos em demo** · validar push no APK |
| Firebase real / piloto APK | **Depois** — estrutura já pensada; conectar só quando o protocolo estiver ok em demo |

**MVP clínico útil (form + painel + métricas)** ≈ pronto em demo.  
**Próximo bloqueio de produto:** protocolo de ciclo (acordar fixo, janela de 5h, histórico, push Android). Firebase continua **depois**.

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
| **8** | Protocolo de ciclo | Hora de acordar + janela 5h + falha/sucesso (demo) |
| **9** | Histórico de ciclos | Paciente + profissional (completos e incompletos) |
| **10** | Push Android | Lembretes +10 min e −10 min da janela (piloto) |

---

## Papéis (não esquecer)

- **Paciente:** inicia ciclo (escolhe hora de acordar **uma vez**), preenche cada dia na janela de **5 horas**; vê histórico dos ciclos.
- **Profissional (ela = admin da clínica):** vê pacientes, ciclos atuais e antigos (válidos e falhos); preenche/corrige **qualquer dia, a qualquer hora**; lê folha por dia.
- **Admin técnico (você):** Firebase Console no piloto (ainda não).

### Protocolo clínico do ciclo (reunião ago/2026 — substitui o meio-dia)

Fuso: **`America/Sao_Paulo`**.

1. Ciclo = **sempre 7 dias**.
2. No **início**, o paciente escolhe a **hora de acordar da semana**. Não muda depois.
3. Todo dia, o preenchimento do **paciente** abre na **hora de acordar** e fecha em `wakeTime + 5 h`.
4. Push (piloto Android): **+10 min** após acordar e **−10 min** antes de fechar — **só se o dia ainda não foi salvo**. Ao salvar, cancela o que restar daquele dia.
5. Depois do prazo: dia **bloqueado para o paciente**. A **profissional pode corrigir quando quiser**.
6. Precisa de **≥ 5 dias preenchidos** nos 7 para o ciclo ser **válido**.
7. Se já for **impossível** chegar a 5 (ex.: 3 dias perdidos) → status **`failed`** + mensagem de encerramento no app.
8. **Parabéns** só no **fim dos 7 dias**, se `filledDays >= 5` (não celebra no 5º dia).
9. Paciente pode fazer **vários ciclos**. Completos **e incompletos** entram no **histórico** (paciente + doutora).

---

## Sprint 0 — Planejamento `[FEITO]`

**Meta:** arquiteto fecha o plano; profissional valida o espelho do PDF.

- [x] Ler PDF Diário de Sono Padrão
- [x] Analisar arquitetura dos vizinhos (Coach-em, Tiro, Carol, EletroNovo, cora-ai, CooPs)
- [x] README + ARQUITETURA + FORMULARIO + FIRESTORE + OCR + este ROADMAP
- [x] Regra clínica inicial: após 12:00 (substituída no Sprint 8 pelo protocolo de 5h)
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
- [x] **Regra 12:00** (`canSaveDay`, fuso Brasília) — a substituir no Sprint 8
- [x] Tela Semana + progresso
- [x] Texto de boas-vindas no Início do paciente
- [ ] Teste com Firebase real

---

## Sprint 3 — Vínculo + painel da profissional `[FEITO no código]`

- [x] Código de convite (`inviteCode`)
- [x] Paciente vincula → `sonoPatients`
- [x] Lista de pacientes + aderência
- [x] Profissional preenche/edita dia do paciente
- [x] Dias passados liberados para ela; hoje após 12h também (corte só no paciente) — Sprint 8: ela continua livre a qualquer hora
- [x] OCR a partir do dia escolhido (não só da semana)
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
- [ ] Notificação local “lembrete manhã” → **substituído pelo Sprint 10** (protocolo de push)
- [ ] PDF/relatório semanal para prontuário (opcional)
- [ ] Política de privacidade + termos finais
- [ ] Decisão: Play Store interna vs só APK clínica

**Critério de pronto:** checklist jurídico mínimo ok; app estável no piloto.

---

## Sprint 8 — Protocolo de ciclo (acordar + janela 5h) `[EM ANDAMENTO]`

**Meta:** o meio-dia some. O ciclo vira um tratamento com hora fixa e prazo de 5h — ainda **em demo**, sem Firebase.

**Regras fechadas com a Ana:**

| Item | Decisão |
|------|---------|
| Hora de acordar | Só no início do ciclo; **imutável** |
| Janela do paciente | Da **hora de acordar** até `wakeTime + 5 h` |
| Push +10 min | Só se o dia **ainda não** foi preenchido |
| Push −10 min do fim | Só se o dia **ainda não** foi preenchido |
| Ao salvar o dia | Cancela os pushes restantes daquele dia |
| Profissional | Corrige **quando quiser** |
| Fuso | Brasília |
| Válido | ≥ 5 de 7 dias preenchidos |
| Falha antecipada | 3 dias perdidos (impossível chegar a 5) |
| Parabéns | Só **depois dos 7 dias**, se ≥ 5 preenchidos |

- [x] Tipos: `wakeTime`, `WeekStatus` = `open \| complete \| failed \| reviewed`
- [x] `canSaveDay` usa janela do ciclo (não mais 12:00)
- [x] Tela de início de ciclo: escolher hora de acordar (obrigatória)
- [x] Encerrar ciclo `failed` com mensagem no app
- [x] Encerrar ciclo `complete` + tela de parabéns (efeito visual)
- [x] DemoStore: lifecycle + Elena com `wakeTime`; Marina define no Início
- [x] Copy: explicar por que a hora é fixa (cálculos / tratamento)
- [ ] Push (Sprint 10)
- [ ] Histórico multi-ciclo (Sprint 9)

**Critério de pronto:** paciente demo inicia ciclo, preenche na janela, perde prazo, profissional ainda edita; falha e parabéns aparecem.

---

## Sprint 9 — Histórico de ciclos (paciente + doutora) `[FEITO no código — demo]`

**Meta:** o estudo não some. Vários ciclos por paciente; incompletos também.

- [x] Lista de ciclos do paciente (aberto, válido, falho) com datas e aderência (ex. 5/7)
- [x] Abrir ciclo antigo em **leitura** (paciente); profissional pode **corrigir** se precisar
- [x] Painel da doutora: histórico por paciente (todos os ciclos, inclusive falhos)
- [x] Iniciar **novo ciclo** só se o anterior estiver fechado (`complete` ou `failed`)
- [x] Métricas/médias por ciclo no histórico
- [x] Estrutura pronta para Firestore (`listWeeksForPatient` / `startNewCycle`) — **sem conectar `.env` ainda**
- [x] Demo: Elena + Marina com ciclos válidos e falhos no arquivo

**Critério de pronto:** Elena/Marina têm 2+ ciclos no demo; Ana abre o histórico e vê falha e sucesso. ✅

**Estimativa:** 3–5 dias.

---

## Sprint 10 — Push Android (piloto) `[FEITO no código — local]`

**Meta:** lembrar de preencher sem voltar à regra das 12h.

| Horário | Mensagem |
|---------|----------|
| `wakeTime + 10 min` | Hora de preencher o diário de hoje (**só se ainda não salvou**) |
| `wakeTime + 5 h − 10 min` | Faltam 10 minutos… (**só se ainda não salvou**) |

Ao **salvar o dia**, reagenda o ciclo: aquele dia sai da fila (cancela 1º e/ou 2º push restantes).

- [x] Permissão de notificação (Android / iOS API)
- [x] Agendar 2 locais por dia do ciclo (Expo Notifications)
- [x] Cancelar/reagendar se o dia já foi preenchido
- [x] Não agendar push para profissional
- [x] Plugin + permissões no `app.json`
- [ ] Validar em APK Android real (Expo Go tem limites)
- [ ] iOS: só depois do piloto (conta Apple)

**Critério de pronto:** no Android de teste, as duas notificações disparam no horário de Brasília. ⏳ validar no APK

**Estimativa:** 3–4 dias.

---

## Ordem de prioridade (resumo)

| Prioridade | Item | Status |
|------------|------|--------|
| P0 | Auth + formulário paciente = folha / Sono à Vista | ✅ demo |
| P0 | Painel profissional + vínculo | ✅ demo |
| P0 | Cálculos LIS…EF | ✅ código / ⏳ validar com ela |
| **P0** | **Protocolo de ciclo (Sprint 8)** | ⏳ **agora** |
| **P0** | **Histórico de ciclos (Sprint 9)** | ⏳ |
| **P1** | **Push Android (Sprint 10)** | ⏳ |
| P1 | OCR com revisão (Gemini) | ⏳ UI pronta |
| P1 | Piloto APK | ⏳ |
| P2 | Firebase real + `.env` | ⏳ depois do protocolo em demo |
| P2 | Push iOS | ⏳ pós-piloto |
| P2 | Relatório PDF / loja | ⏳ |

---

## Timeline sugerida (calendário)

| Semana | Entrega | Status |
|--------|---------|--------|
| S0 | Docs + alinhamento + nome | ✅ |
| S1 | Scaffold + Auth | ✅ |
| S2 | Form paciente | ✅ |
| S3 | Painel profissional | ✅ |
| S4 | Métricas | 🟡 parcial |
| S5–S6 | OCR | 🟡 UI/demo |
| — | Identidade + Sono à Vista | ✅ |
| **S8** | **Protocolo de ciclo (demo)** | ⏳ **próximo** |
| **S9** | **Histórico de ciclos** | ⏳ |
| **S10** | **Push Android** | ⏳ |
| Depois | Firebase + piloto APK | ⏳ |
| Depois | Push iOS + polish / LGPD | ⏳ |

**MVP clínico útil** ≈ fim do Sprint 4 — **alcançado em demo**.  
**MVP do método dela** ≈ fim do Sprint 8–10 (ciclo + histórico + push Android).

---

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Paciente achar “mais um app chato” | UI = 1 tela/dia; copy dela; zero features extras no MVP |
| TTC/TTS ambíguos no PDF | Validar fórmulas com ela no Sprint 4 |
| OCR fraco em letra ruim | Revisão obrigatória; nunca auto-publicar |
| Paciente perde 3 dias | Encerrar cedo com mensagem clara; ciclo vai para o histórico |
| Push não dispara (doze/kill) | Piloto Android; fallback no Início (“janela aberta até …”) |
| Emulador em UTC | Tudo em `America/Sao_Paulo` |
| Escopo crescer | Backlog congelado até pós-piloto |

---

## Backlog pós-MVP (não agora)

- Push iOS
- Multi-profissional / clínica SaaS
- Gráficos de tendência multi-ciclo
- Integração prontuário
- Wearables
- i18n

---

## Próxima ação imediata

1. **Sprint 8** — protocolo de ciclo em demo (hora de acordar + janela 5h + falha/parabéns).
2. **Sprint 9** — histórico (paciente + doutora; ciclos falhos inclusive).
3. **Sprint 10** — push Android.
4. Firebase / APK piloto **depois** que o protocolo estiver estável em demo.
