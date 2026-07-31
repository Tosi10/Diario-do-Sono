# OCR Pipeline — Folha manuscrita → formulário

Objetivo: pacientes que preferem papel continuam no método dela; a clínica **não perde o dado digital**. A IA só **propõe**; humano **confirma**.

Precedente na casa: EletroNovo (Gemini multimodal → JSON de laudo) e Carol (STT + Gemini com revisão).

---

## Fluxo

```
[Foto da folha]
      │
      ▼
 Storage: sono/diary-photos/{patientUid}/{jobId}.jpg
      │
      ▼
 sonoOcrJobs status=pending
      │
      ▼
 Cloud Function (Storage trigger ou callable)
   · Gemini Flash multimodal
   · Prompt com schema fixo (Q0–Q10 + qualidade × 7 cols)
      │
      ▼
 status=needs_review + draftDays[]
      │
      ▼
 Tela Revisão (foto | campos editáveis)
      │
      ▼
 Confirmar → grava sonoDays + atualiza sonoWeeks
 status=confirmed
```

---

## Quem pode enviar foto

| Ator | Caso de uso |
|------|-------------|
| Paciente | Tirou foto em casa e manda no app |
| Profissional | Paciente entregou folha na consulta; ela fotografa e sobe |

Configurável por clínica (`ocrUploaders: 'both' | 'professional_only'`). Default piloto: **ambos**.

---

## Por que Gemini (não OCR clássico só)

- Quase tudo é **número / hora**, mas layout é **tabela 7 colunas** + manuscrito.
- Modelo multimodal entende grade melhor que Tesseract puro em células tortas.
- Mesmo padrão já usado em EletroNovo para imagem → JSON estruturado.
- Opcional depois: Google Cloud Vision como pré-passo; MVP = Gemini direto.

---

## Contrato do JSON (schema)

A function exige resposta JSON válida (sem markdown) no formato:

```json
{
  "patientNameGuess": "string|null",
  "days": [
    {
      "dayIndex": 1,
      "date": "DD/MM ou null",
      "q0": "HH:mm|null",
      "q1": "HH:mm|null",
      "q2": "HH:mm|null",
      "q3": "HH:mm|null",
      "q4Min": 30,
      "q5": 4,
      "q6Minutes": [10, 30,.15, 5],
      "q7Min": 360,
      "q8": "string|null",
      "q9": "string|null",
      "q10": "string|null",
      "qualityFeel": 0,
      "qualityEnjoy": 0,
      "confidence": 0.0
    }
  ],
  "warnings": ["coluna 3 ilegível", "..."]
}
```

Campos `null` / low `confidence` → destaque vermelho na revisão.

---

## UX de revisão (obrigatória)

1. Thumbnail / zoom da foto.
2. Seletor de coluna (Dia 1…7) ou lista.
3. Cada campo editável; pré-preenchido pelo draft.
4. Botões: **Confirmar dia** / **Confirmar semana** / **Descartar**.
5. Após confirmar, métricas calculadas como entrada manual.

**Regra de ouro:** nenhum `sonoDays` é criado só com a resposta crua do modelo.

---

## Segurança

- API key Gemini em **Secret Manager** / Firebase Functions config.
- Callable / trigger valida `auth` + vínculo paciente–profissional.
- App Check em produção.
- Não logar conteúdo clínico completo em texto claro nos logs de erro.

---

## Critérios de aceite (piloto)

1. Folha preenchida com o exemplo do PDF → ≥ 80% dos campos numéricos corretos sem edição.
2. Campos errados corrigíveis em &lt; 2 min na revisão.
3. Sem confirmação, dados **não** entram nas médias clínicas.
