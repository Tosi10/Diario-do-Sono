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
| Identidade visual no app | **Feito** — Manual 2026: Bethany Elingston + Work Sans, HEX oficiais, selo + logo vertical |
| Landing Ana Gonçalves | **Deployado** — [anagoncalvespsiquiatra.com.br](https://anagoncalvespsiquiatra.com.br) (+ Firebase `ana-goncalves.web.app`) |
| Sprints 1–3 (código) | **Feito** em modo demo (sem Firebase `.env`) |
| Sprint 4 métricas | **Parcial** — LIS…EF no app; validar com ela |
| Sprint 5 OCR | **Parcial** — UI + mock demo; Gemini/Storage pendente |
| Protocolo de ciclo (hora de acordar + 5h + push) | **Sprints 8–10 feitos em demo** · validar push no APK |
| UI polish (rebrand + Diário em abas) | **Em andamento** — empty states + modal padrão; ver registro |
| Firebase real / piloto APK | **Depois** — aguarda CNPJ + novo projeto Firebase |
| Admin clínico (aprovar / bloquear / remover paciente) | **Demo UI feita** — Pacientes com Pendentes; Firebase depois |

**MVP clínico útil (form + painel + métricas)** ≈ pronto em demo.  
**Próximo bloqueio de produto:** validação clínica com a Dra. Ana (Sprint 4). UI clínica editorial **congelada em demo**. Firebase continua **depois**.

---

## Registro de mudanças

Histórico para saber o que mudou entre sessões (mais recente primeiro).

### 31 ago/2026 — Polish UI + Diário em abas (sem Firebase)

**Identidade visual (app)**
- [x] HEX oficiais do Manual 2026 em `src/theme/brand.ts` e `tailwind.config.js` (Terra `#78494E`, Marfim `#F2EDE0`, Argila `#AD665C`, Oliva `#A39D79`, Areia `#E0D6C1`)
- [x] Fontes Bethany Elingston (regular + itálico) em `assets/fonts/`; Bodoni Moda substituída no `_layout.tsx`
- [x] Assets oficiais: `seal.png` (selo terra), `logo-vertical-claro.png`
- [x] Splash / ícone Android / cor de notificação atualizados em `app.json`
- [x] Login com logo vertical (`BrandMark variant="logoVertical"`)
- [x] Sidebar web com logo vertical (`AdaptiveTabBar`)

**Layout e componentes compartilhados**
- [x] `PageHeader` — título + subtítulo + voltar; corrige corte no topo (safe area + lineHeight Bethany)
- [x] `Screen` — padding superior extra no Android
- [x] `GreetingBlock`, `SectionTitle`, `screenScrollContent` — padrão nas telas principais
- [x] `SegmentTabs` — abas com `StyleSheet` nativo (evita crash do NativeWind com classes dinâmicas)
- [x] `DiaryCycleScreenBody` — corpo compartilhado paciente + profissional

**Diário reorganizado (paciente + profissional)**
- [x] Três abas abaixo do título: **Semana atual** · **Estatísticas** · **Histórico**
- [x] Estatísticas vazias mostram mensagem explicativa (não quebra)
- [x] Ao escolher ciclo no histórico → volta para aba Semana atual
- [x] Telas: `app/(patient)/week.tsx`, `app/(professional)/patient/[id]/index.tsx`

**Polish de telas**
- [x] Início paciente e profissional — `GreetingBlock` + `PageHeader`
- [x] Pacientes, Perfil (ambos papéis), formulário do dia — `PageHeader`
- [x] Cards de ciclo (`CycleCards`), modal (`AppAlert`) — tipografia Bethany consistente
- [x] Spinners com cor Argila oficial (`#AD665C`)

**Correções**
- [x] Crash ao trocar abas Estatísticas/Histórico (NativeWind + `shadow-sm` dinâmico)
- [x] Aba da grade muda o rótulo: **Semana atual** (ciclo aberto) ou **17/08–23/08** (ciclo passado)
- [x] Voltar do dia → retorna ao paciente/semana corretos (`weekId` na navegação; Tabs do Expo Router não empilham stack)
- [x] Lifecycle de ciclo: semanas passadas fecham automaticamente (`complete`/`failed`); só **1** ciclo `open` por paciente
- [x] `BackButton` — pill compacto com chevron; rótulos contextuais (Pacientes, Diário, etc.)

### 31 ago/2026 (continuação) — OCR + empty states

- [x] `EmptyState` — componente editorial com fotos oficiais (`empty-ginkgo.jpg`, `empty-rest.jpg`)
- [x] OCR profissional — `PageHeader`, placeholder de foto, lista vazia de pacientes
- [x] Revisão OCR — voltar explícito para folha; `weekId` ao confirmar e gravar
- [x] Início profissional, Pacientes, Histórico de ciclos — empty states com foto

### 31 ago/2026 (continuação) — Empty states paciente + modal

- [x] `EmptyState` — variante `compact` para cards internos
- [x] Início paciente — sem vínculo com profissional (foto + CTA Perfil)
- [x] Perfil paciente — estado vazio antes do código de vínculo
- [x] Diário — aba Estatísticas sem médias (`DiaryCycleScreenBody`)
- [x] Dia (`today`) — futuro, sem vínculo e dia passado sem registro
- [x] `AppAlert` — modal padrão refinado (barra argila, backdrop, botões em linha)

**Pendente (próximo polish)**
- [ ] Remover dependência `@expo-google-fonts/bodoni-moda` do `package.json`
- [ ] Atualizar `docs/IDENTIDADE-VISUAL.md` (app section)
- [ ] Roteiro de validação clínica com a Dra. Ana (Sprint 4)

### Landing (31 ago/2026 — deploy para Dra. Ana)
- Site: **https://anagoncalvespsiquiatra.com.br** (domínio) · espelho Firebase: `ana-goncalves.web.app`
- Depoimentos editorial (grid assimétrico), fundo `11.jpg`, rodapé oliva original
- Aguardando feedback da Dra. Ana antes de considerar versão final

### 12 set/2026 — UI clínica editorial (demo)

- [x] `Screen atmosphere="soft"` — fundo foto de marca + lavagem marfim (contraste ajustado)
- [x] `ClinicChrome` — faixa de stats, callout de pendentes, cards/linhas de pacientes e atualizações
- [x] Início + Pacientes (profissional): hierarquia editorial, sem cards idênticos em massa
- [x] Stats do Início: só **Ativas** + **Hoje ok** (sem “Sem diário”, redundante)
- [x] Ativos: `1/7` + **Gerir** alinhados na mesma linha à direita
- [x] Soft atmosphere no ciclo (paciente/profissional), perfis e Início do paciente
- [x] Scroll da grade (semana/stats/histórico) full-bleed — indicador na borda da tela
- [ ] Soft atmosphere em OCR / dia avulso (opcional)
- [ ] Roteiro de validação clínica com a Dra. Ana

### 12 set/2026 — Admin clínico em demo (Sprint 11 UI)

- [x] `LinkStatus`: `none | pending | active | blocked | removed`
- [x] Cadastro paciente → fila automática da Dra. Ana (**sem código**)
- [x] Demo seed: Júlia Torres + Pedro Alves em **Pendentes**
- [x] Aba **Pacientes**: Pendentes (Aprovar/Recusar) · Ativos (Gerir → Bloquear/Remover) · Bloqueados (Desbloquear)
- [x] Início profissional: card “Aguardando você” com contagem
- [x] Perfil paciente: status do vínculo (sem campo de código)
- [x] Perfil profissional: copy mono-doutora (sem código)
- [ ] Firebase + e-mails — quando CNPJ / projeto empresarial

### 02 set/2026 — SEO técnico (landing)

- [x] `robots.txt` + `sitemap.xml` gerados no build (`scripts/generate-seo.mjs`)
- [x] Meta tags: canonical, Open Graph, Twitter Card, `theme-color`
- [x] JSON-LD (`Physician` + `MedicalBusiness` + `WebSite`) inline no HTML
- [x] `VITE_SITE_URL` em `.env.production` — trocar ao migrar domínio/Firebase
- [ ] Google Search Console — cadastrar URL provisória e depois domínio final
- [ ] Google Business Profile (Cuidar / Dra. Ana) — linkar site
- [ ] Migração semana que vem: DNS → Firebase empresarial + redirect 301 do `.web.app`

### 31 ago/2026 — Decisão: app mono-doutora, sem código

- App exclusivo da **Dra. Ana Heloisa Gonçalves** — paciente cadastra e entra **pendente** na fila dela
- **Remover** fluxo de `inviteCode` / MAPA01 na UI (demo mantido até Firebase; refatorar no Sprint 11)
- Portão real = **aprovação + bloqueio/remoção** dela, não código na consulta
- Config futura: `CLINIC_PROFESSIONAL_UID` no `.env` (hoje hardcoded demo Ana)
- Multi-doutor: backlog pós-MVP, se necessário

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

- **Paciente:** cria conta → **vinculado automaticamente** à Dra. Ana (pendente); só usa o diário **depois da aprovação** dela. Sem código. Inicia ciclo, preenche na janela de **5 horas**; vê histórico dos ciclos.
- **Profissional / admin (Dra. Ana — dona do app):** **controle total** da clínica — aprovar ou recusar pedidos, ver pacientes ativos, **bloquear** ou **remover** quem não deve mais usar o app; vê ciclos atuais e antigos; preenche/corrige **qualquer dia, a qualquer hora**; recebe **e-mail** quando há confirmação pendente.
- **Admin técnico (você):** Firebase Console, Functions, domínio de e-mail — no piloto.

> **Decisão ago/2026:** app **mono-doutora** — só a Dra. Ana Heloisa Gonçalves. Quem baixa, cadastra como paciente e **cai automaticamente na fila dela** (status **pendente**). **Sem código de vínculo.** Aprovação dela é o único portão. Multi-profissional fica para uma versão futura, se existir.

### Fluxo de vínculo (alvo — com Firebase)

```
Paciente baixa o app → cadastro (nome + e-mail + senha)
       ↓
Sistema associa automaticamente à Dra. Ana (professionalId fixo no app)
       ↓
Status: pendente — EmptyState “Aguardando confirmação da Dra. Ana”
       ↓
Dra. Ana: badge Pendentes + e-mail “Novo cadastro aguardando”
       ↓
Ela escolhe:  [ Aprovar ]  [ Recusar ]
       ↓
Aprovado → diário, ciclo e push liberados
Recusado → mensagem clara; conta existe, mas sem acesso clínico
```

**Gestão contínua (lista Pacientes):**

| Ação | Efeito para o paciente | Dados clínicos |
|------|------------------------|----------------|
| **Bloquear** | Não preenche mais; vê aviso | Histórico **preservado** (consulta / LGPD) |
| **Remover da clínica** | Perde vínculo; conta pode existir | Semanas/dias **mantidos** no Firestore (arquivo clínico) |
| **Excluir definitivo** | Só se ela confirmar + LGPD | Function de export/apagar (Sprint 7) |

**E-mails (Cloud Functions + domínio clínico):**

- Para **ela:** novo pedido pendente; resumo opcional diário de pendentes.
- Para **paciente:** “Vínculo aprovado” / “Pedido recusado” (tom profissional, curto).

**UI simples para ela:** badge **Pendentes (N)** no Início ou aba Pacientes; cards com nome, e-mail, data; um toque para aprovar; menu ⋮ em cada paciente → Bloquear / Remover.

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

## Sprint 3 — Vínculo + painel da profissional `[FEITO no código — demo]`

- [x] Código de convite (`inviteCode`) — **legado demo; remover no Sprint 11**
- [x] Paciente vincula → `sonoPatients` **(demo: instantâneo + código — substituído por cadastro → pendente → Ana)**
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

## Sprint 7 — Polish, LGPD e valor de clínica `[PARCIAL — branding + UI]`

**Meta:** base para continuidade / possível loja ou white-label.

- [x] Branding app: cores Terra/Marfim/Argila/Oliva, tipografia, selo, splash claro
- [x] Rebrand Manual 2026: Bethany Elingston, HEX oficiais, logo vertical, assets copiados da landing
- [x] Diário em 3 abas (Semana atual / Estatísticas / Histórico) — paciente + profissional
- [x] `PageHeader`, safe area, tipografia consistente nas telas principais
- [x] Landing da marca pessoal (Ana Gonçalves) — separado do produto
- [x] Fotos oficiais no app (empty states — paciente + profissional)
- [ ] Polish OCR + telas secundárias profissionais
- [ ] App Check
- [ ] Exportar / apagar dados (LGPD Functions)
- [ ] Notificação local “lembrete manhã” → **substituído pelo Sprint 10** (protocolo de push)
- [ ] PDF/relatório semanal para prontuário (opcional)
- [ ] Política de privacidade + termos finais
- [ ] Decisão: Play Store interna vs só APK clínica

**Critério de pronto:** checklist jurídico mínimo ok; app estável no piloto.

---

## Sprint 8 — Protocolo de ciclo (acordar + janela 5h) `[FEITO no código — demo]`

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
- [x] Push local (Sprint 10)
- [x] Histórico multi-ciclo (Sprint 9)
- [ ] Validar janela 5h + falha/parabéns com a Dra. Ana em sessão demo

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

## Sprint 11 — Admin clínico (Dra. Ana dona do app) `[DEFINIDO — implementar com Firebase]`

**Meta:** autonomia total da profissional — cadastro do paciente **já cai na fila dela** (sem código); ela **aceita**, **bloqueia** e **remove**; e-mails de pendências.

**Config (app mono-doutora):**

- `EXPO_PUBLIC_CLINIC_PROFESSIONAL_UID` — UID fixo da Dra. Ana no Firebase
- Registro paciente → `linkStatus: 'pending'`, `linkedProfessionalId: <Ana>`, cria `sonoLinkRequest`
- **Sem** `inviteCode` na jornada do paciente; campo pode permanecer no schema só para versão multi-clínica futura

**Modelo de dados (Firestore):**

- `sonoUsers.linkStatus`: `'none' | 'pending' | 'active' | 'blocked' | 'removed'`
- `sonoLinkRequests/{id}` — fila: `patientUid`, `professionalId`, `status`, `requestedAt`, `resolvedAt`, `resolvedBy`
- `sonoPatients.status` — espelha vínculo ativo; histórico clínico **nunca apaga** ao bloquear/remover

**App — paciente:**

- [x] Remover tela/campo de código no Perfil (demo)
- [x] Após cadastro: status **pendente** (EmptyState) (demo)
- [x] Bloqueado: aviso claro, sem formulário (demo)
- [x] Aprovado: fluxo atual (ciclo, diário, push) (demo)

**App — profissional:**

- [x] Seção **Pendentes** com badge no Início / Pacientes (demo)
- [x] Aprovar / Recusar (com confirmação `AppAlert`) (demo)
- [x] Por paciente: **Bloquear** · **Remover da clínica** (demo)
- [x] Empty states quando fila vazia / sem ativos (demo)

**Backend (Firebase):**

- [ ] Firestore rules: só ela (`professionalId`) altera status dos seus pacientes
- [ ] Cloud Function `onLinkRequestCreated` → e-mail para `pro.email`
- [ ] Cloud Function `onLinkResolved` → e-mail opcional ao paciente
- [ ] Domínio remetente: `contato@cuidar.med.br` ou noreply clínica

**Critério de pronto (demo UI):** Dra. Ana vê Pendentes, aprova/recusa, bloqueia/remove — ✅  
**Critério de pronto (produção):** + e-mail + Auth real — ⏳ Firebase/CNPJ

**Estimativa restante:** 2–3 dias ao ligar Firebase.

**Depende de:** projeto Firebase dedicado, `.env`, CNPJ.

---

## Ordem de prioridade (resumo)

| Prioridade | Item | Status |
|------------|------|--------|
| P0 | Auth + formulário paciente = folha / Sono à Vista | ✅ demo |
| P0 | Painel profissional + vínculo | ✅ demo |
| P0 | Cálculos LIS…EF | ✅ código / ⏳ validar com ela |
| **P0** | **Protocolo de ciclo (Sprint 8)** | ✅ demo · ⏳ validar com ela |
| **P0** | **Histórico de ciclos (Sprint 9)** | ✅ demo |
| **P1** | **Push Android (Sprint 10)** | ✅ código · ⏳ APK |
| **P1** | **Polish UI (Sprint 7)** | ✅ editorial soft + ClinicChrome · OCR/dia opcional |
| P1 | OCR com revisão (Gemini) | ⏳ UI pronta |
| P1 | Piloto APK | ⏳ |
| P2 | Firebase real + `.env` + **Sprint 11 admin** | ⏳ aguarda CNPJ |
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
| **S8** | **Protocolo de ciclo (demo)** | ✅ |
| **S9** | **Histórico de ciclos** | ✅ |
| **S10** | **Push Android** | ✅ código · ⏳ APK |
| **S7** | **Polish UI + rebrand app** | ⏳ em andamento |
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

1. **Aguardar CNPJ + Firebase** — conectar `.env` e implementar **Sprint 11** (aprovação, bloqueio, e-mails).
2. **Landing** — feedback da Dra. Ana nos depoimentos e textos.
3. **Sprint 4** — sessão demo: validar métricas, formulário e fluxo do ciclo (+ admin Pacientes).
4. **Sprint 6** — EAS APK para push no Android real.
5. Polish UI restante — OCR / dia avulso com `atmosphere="soft"` (opcional).
