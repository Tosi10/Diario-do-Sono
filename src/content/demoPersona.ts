/** Persona da demonstração para apresentação à Dra. Ana. */
export const demoPersona = {
  professional: {
    uid: "demo-session-pro",
    email: "ana@mapadosono.demo",
    displayName: "Ana Gonçalves",
    clinicName: "Clínica Cuidar",
    inviteCode: "MAPA01",
    /** Aceitos no vínculo demo (legado DEMO01). */
    inviteAliases: ["MAPA01", "DEMO01"] as const,
  },
  patient: {
    uid: "demo-session-patient",
    email: "marina@mapadosono.demo",
    displayName: "Marina Costa",
  },
  loginBlurb:
    "Protótipo para a Dra. Ana Gonçalves — Clínica Cuidar. Dados de exemplo, sem banco ainda. Pacientes novos entram pendentes até ela aprovar.",
} as const;
