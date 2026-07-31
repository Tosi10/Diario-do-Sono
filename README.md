# Diário do Sono

App **React Native (Expo)** para acompanhamento clínico de insônia. Feito sob medida para o método da profissional: formulário simples, poucos passos, cálculos automáticos e (em breve) foto da folha + IA.

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

Após **12:00** (horário local) **não dá para gravar o dia de hoje** — consistência do método.  
A profissional **pode** registrar **dias anteriores** (folha na consulta). Hoje, depois do meio-dia, também fica bloqueado para ela.

---

## Documentação

| Doc | Conteúdo |
|-----|----------|
| [`ROADMAP.md`](ROADMAP.md) | Sprints |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Arquitetura |
| [`docs/FORMULARIO-DIARIO.md`](docs/FORMULARIO-DIARIO.md) | Q0–Q10 + fórmulas |
| [`docs/FIRESTORE-MODEL.md`](docs/FIRESTORE-MODEL.md) | Coleções `sono*` |
| [`docs/OCR-PIPELINE.md`](docs/OCR-PIPELINE.md) | Foto → revisão (próximo) |

## Status

🟢 **Sprint 1–3 em código** — scaffold, auth, form paciente, painel profissional, regra 12h, métricas base (LIS…EF).  
OCR e equações extras: depois do alinhamento com ela.
