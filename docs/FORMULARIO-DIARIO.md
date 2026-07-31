# Formulário — Diário de Sono (mapa PDF → app)

Fonte: *DIÁRIO DO SONO PADRÃO* (PDF da profissional). O app **não inventa perguntas**; só digitaliza este protocolo.

---

## Instrução ao paciente (produto)

- Completar **uma coluna por manhã**, ao levantar.
- Estimativa subjetiva é o que importa — não vigiar o relógio.
- Unidade clínica: **7 noites (1 semana)**.

---

## Bloco A — Padrão de sono (por dia)

| Código | Pergunta (UI curta) | Tipo no app | Exemplo PDF | Notas |
|--------|---------------------|-------------|-------------|-------|
| `date` | Data de hoje | `DD/MM` ou `Date` ISO (dia civil da manhã) | 31/05/17 | Chave do dia na semana |
| `Q0` | A que horas você acordou? | `time` (HH:mm) | 6:00 | Despertar final do período de sono |
| `Q1` | A que horas você saiu da cama? | `time` | 6:30 | Pode ser ≠ Q0 |
| `Q2` | A que horas foi para a cama (noite passada)? | `time` | 23:00 | Pode ≠ início da tentativa de dormir |
| `Q3` | A que horas decidiu tentar dormir? | `time` | 23:30 | Início da “tentativa” |
| `Q4` | Quanto tempo levou para iniciar o sono? | `durationMin` (minutos) | 30 | = **LIS** |
| `Q5` | Quantas vezes despertou? (sem o final) | `number` int ≥ 0 | 4 | = **FDN** |
| `Q6` | Duração de cada despertar (min) | `number[]` minutos **ou** total | 10, 30, 15, 5 | Soma = **TA**; UI: lista dinâmica |
| `Q7` | Ao todo, quanto tempo dormiu? | `durationMin` | 6h | = **TTS** (relato); ver flag abaixo |
| `Q8` | Álcool na noite passada? | `string` curto | 1 taça de vinho | Texto livre estruturado |
| `Q9` | Comprimidos para dormir? | `string` curto | 1 Stillnox | Dose + medicamento |
| `Q10` | Comentários | `string` opcional | Tive febre | Só se relevante |

### UX de tempo

- Time pickers nativos / wheel simples (evitar digitação frágil).
- Durações: entrada em **minutos** (ou horas+minutos com conversão interna para minutos).
- `Q6`: adicionar N linhas (“despertar 1, 2…”) conforme `Q5`, ou um total único se a profissional aceitar atalho.

---

## Bloco B — Qualidade do sono (por dia)

Escala **0–10** (slider ou botões):

| Código | Pergunta | Âncoras |
|--------|----------|---------|
| `qualityFeel` | O quanto você se sente bem essa manhã? | 0 Nada · 5 Moderado · 10 Muito |
| `qualityEnjoy` | O quanto aproveitou o sono da noite passada? | 0 Nada · 5 Moderado · 10 Muito |

---

## Bloco C — Uso do profissional (calculado)

Distribuído no rodapé do PDF; no app vira painel por dia + **médias da semana**.

| Sigla | Nome | Fonte / fórmula | Unidade |
|-------|------|-----------------|---------|
| **LIS** | Latência para início do sono | = Q4 | min |
| **FDN** | Frequência de despertares noturnos | = Q5 | contagem |
| **TA** | Tempo acordado no meio do sono | = soma(Q6) | min |
| **TTS** | Tempo total de sono | = Q7 **ou** `TTC − (LIS + TA)` | min |
| **DPM** | Despertar precoce matutino | = Q1 − Q0 | min |
| **TTC** | Tempo total na cama | = intervalo Q2 → Q1 (cruza meia-noite) | min |
| **TTA** | Tempo total acordado | = LIS + TA + DPM | min |
| **EF** | Eficiência do sono | = (TTS / TTC) × 100 | % |

### Observações clínicas (validar com a profissional)

1. **TTC no PDF** está escrito “Q2 − Q1”. Na prática clínica, é o tempo **na cama da noite até sair da cama de manhã** (ex.: 23:00 → 06:30 = 450 min). Implementar com helper que cruza meia-noite.
2. **DPM = Q1 − Q0** no mesmo período matutino (ex.: 6:30 − 6:00 = 30 min).
3. PDF sugere que o profissional pode preferir **TTS calculado** `TTC − (LIS + TA)` em vez de perguntar Q7. App deve:
   - Continuar coletando Q7 (fidelidade ao formulário do paciente).
   - Exibir TTS paciente vs TTS calculado e deixar a profissional escolher qual entra na média (`ttsMode`).
4. Equações **extras** que ela usa depois (além destas 8) entram no Sprint de métricas quando forem entregues — extensão em `src/domain/sleepMetrics.ts` sem mudar o formulário do paciente.

### Médias da semana

Para cada variável: média aritmética dos dias **preenchidos** (não forçar 7 se faltarem dias; mostrar n=).

---

## Modelo TypeScript (esboço)

```ts
type TimeHHmm = string; // "23:30"
type Minutes = number;

interface SleepDayInput {
  date: string; // ISO date of morning
  q0: TimeHHmm;
  q1: TimeHHmm;
  q2: TimeHHmm;
  q3: TimeHHmm;
  q4: Minutes;       // LIS
  q5: number;        // FDN
  q6: Minutes[];     // each awakening
  q7: Minutes;       // TTS reported
  q8: string;
  q9: string;
  q10?: string;
  qualityFeel: number;   // 0..10
  qualityEnjoy: number;  // 0..10
}

interface SleepDayMetrics {
  lis: Minutes;
  fdn: number;
  ta: Minutes;
  ttsPatient: Minutes;
  ttsComputed: Minutes;
  dpm: Minutes;
  ttc: Minutes;
  tta: Minutes;
  efPatient: number;
  efComputed: number;
}
```

---

## Telas mínimas (espelho do papel)

| Tela | Analogia PDF |
|------|----------------|
| Form do dia | Uma coluna (Dia N) |
| Grade da semana | Tabela “MEDINDO O PADRÃO…” |
| Qualidade | Bloco “MEDINDO A QUALIDADE…” |
| Painel clínico | “PARA USO DO PSICÓLOGO” + médias |
