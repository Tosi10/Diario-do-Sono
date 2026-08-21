# Mapa do Sono

App **React Native (Expo)** da Dra. Ana Gonçalves para acompanhamento clínico de sono. Formulário simples (método dela), poucos passos, cálculos automáticos e (em breve) foto da folha + IA.

**Stack:** Expo Router · TypeScript · NativeWind · Firebase (Auth, Firestore, Storage)

---

## Como rodar (agora: modo demo, sem banco)

```bash
cd c:\NativeReact\DiarioDoSono
npm install
npx expo start
```

Abra no celular (Expo Go), emulador ou `w` para web.

Na tela de login:
- **Entrar como profissional** — lista de pacientes demo + preencher por eles
- **Entrar como paciente** — formulário de hoje + semana

Sem `.env` o app **não liga Firebase**. Dados ficam só na memória da sessão.

Quando quiser o banco de verdade: copie `.env.example` → `.env`, preencha e reinicie o Metro.

---

## Papéis

| Papel | O que faz |
|-------|-----------|
| **Profissional (admin da clínica)** | Vê pacientes, código de vínculo, preenche diário **no lugar do paciente**, vê métricas |
| **Paciente** | Preenche **hoje** de manhã; vincula com o código dela |

### Regra do meio-dia

Após **12:00 (horário de Brasília / Curitiba)** o **paciente** não grava o dia de hoje — consistência do método.  
A **profissional** pode registrar/corrigir **hoje à noite** e **dias anteriores** (folha entregue na consulta).

---

## Documentação

| Doc | Conteúdo |
|-----|----------|
| [`ROADMAP.md`](ROADMAP.md) | Sprints + status atual |
| [`docs/IDENTIDADE-VISUAL.md`](docs/IDENTIDADE-VISUAL.md) | Cores, fontes, marca |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Arquitetura |
| [`docs/FORMULARIO-DIARIO.md`](docs/FORMULARIO-DIARIO.md) | Q0–Q10 + fórmulas |
| [`docs/FIRESTORE-MODEL.md`](docs/FIRESTORE-MODEL.md) | Coleções `sono*` |
| [`docs/OCR-PIPELINE.md`](docs/OCR-PIPELINE.md) | Foto → revisão (próximo) |
| [`docs/MAPA DO SONO.docx`](docs/MAPA%20DO%20SONO.docx) | Copy oficial da Ana |

## Status

🟢 **Sprints 1–3 feitos em demo** — scaffold, auth, form Mapa do Sono, painel, regra 12h (Brasília), métricas base.  
🟢 **Identidade + nome** — Mapa do Sono, paleta/tipografia/selo no app.  
🟡 **Sprint 4–5 parciais** — métricas a validar com ela; OCR só UI/mock.  
⏳ **Próximo:** Firebase real → piloto APK.
