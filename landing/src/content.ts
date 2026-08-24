/** Ative para publicar só a página de manutenção (site completo fica oculto). */
export const maintenanceMode = false;

export const maintenance = {
  title: "Site em atualização",
  message:
    "Estamos reorganizando o conteúdo do site. Em breve você verá a nova versão por aqui.",
  note: "Para agendar consulta ou falar com a clínica, use o WhatsApp abaixo.",
};

/** Contatos oficiais — WhatsApp e e-mail da Clínica Cuidar. */
export const site = {
  name: "Ana Gonçalves",
  fullName: "Ana Heloisa Gonçalves",
  title: "Psiquiatra",
  titleLong: "Médica Psiquiatra",
  crm: "CRM/PR 23.313",
  rqe: "RQE 190",
  city: "Curitiba",
  instagram: "anag.psiquiatra",
  instagramUrl: "https://instagram.com/anag.psiquiatra",
  /** WhatsApp Business (mesmo número usado na Cuidar) */
  whatsappDisplay: "(41) 99287-3260",
  whatsappUrl: "https://wa.me/5541992873260",
  clinic: "Cuidar! Espaço Saúde",
  email: "contato@cuidar.med.br",
  emailUrl: "mailto:contato@cuidar.med.br",
  address: "Rua Ébano Pereira, 60, sala 1705, Centro  Curitiba/PR",
  tagline: "Saúde mental é abrir espaço para a vida se renovar.",
};

export const nav = [
  { href: "#sobre", label: "Sobre" },
  { href: "#cuidado", label: "O cuidado" },
  { href: "#para-quem", label: "Para quem" },
  { href: "#ciencia", label: "Ciência" },
  { href: "#consulta", label: "A consulta" },
  { href: "#faq", label: "Dúvidas" },
];

/** Textos oficiais — Meu caminho na Psiquiatria.docx + anotações da reunião. */
export const copy = {
  sobre: {
    eyebrow: "Sobre",
    title: "Meu caminho na Psiquiatria",
    subtitle: "Da curiosidade ao cuidado",
    paragraphs: [
      "Sou médica, formada pela Universidade Federal de Santa Catarina em 2006, e concluí minha residência médica no Instituto de Psiquiatria de Santa Catarina (IPq/SC) em 2010. Mas meu interesse pela mente humana e por suas particularidades começou muito antes.",
      "Ainda na infância e na adolescência, ouvindo histórias da minha família e convivendo de perto com pessoas que enfrentavam transtornos mentais, nasceu em mim a curiosidade por compreender melhor o funcionamento da mente e as diferentes formas de sentir, pensar e perceber o mundo. Escolhi a Psiquiatria antes mesmo de prestar o vestibular para Medicina.",
      "Durante a faculdade, embora tenha me interessado por diferentes áreas da Medicina, meu encantamento pela saúde mental permaneceu. Participei de grupos de estudos em Psiquiatria e também me aproximei de outros campos do conhecimento sobre a mente e o comportamento humano.",
      "Após a graduação, segui diretamente para a residência médica. Guardo profunda gratidão pelos coordenadores e preceptores do IPq/SC, que contribuíram para uma formação ampla em Psiquiatria. Para além dos aspectos biológicos dos transtornos mentais, tive contato com conhecimentos da Psicologia e prática em psicoterapia — experiências que ajudaram a construir a maneira como compreendo e exerço a Psiquiatria até hoje.",
    ],
  },
  cuidado: {
    eyebrow: "O cuidado",
    title: "O cuidado",
    paragraphs: [
      "Meu trabalho é pautado pela escuta atenta, pelo vínculo e por uma investigação criteriosa. O diagnóstico é importante, mas não é o único ponto de partida. Interessa-me conhecer a pessoa que está diante de mim: sua história, suas experiências, a maneira como construiu suas percepções e relações com o mundo e o contexto em que vive hoje.",
      "Acredito em um tratamento individualizado, que considere necessidades, história, rotina, valores e possibilidades reais de cada pessoa. Quando necessária, a medicação pode ser uma parte importante desse cuidado, mas não precisa ser a única. Mudanças de hábitos e de comportamento, compreensão dos próprios padrões e construção de novas estratégias também podem fazer parte do processo.",
      "As decisões são construídas em conjunto. Procuro oferecer ao paciente conhecimento e espaço para participar ativamente do próprio tratamento, conciliando suas necessidades e preferências com uma prática segura e baseada em evidências. Mais do que buscar apenas o alívio dos sintomas, meu objetivo é favorecer uma melhora consistente e sustentada ao longo do tempo.",
    ],
  },
  paraQuem: {
    eyebrow: "Para quem",
    title: "Para quem",
    body: "Atendo adultos que vivenciam sofrimento emocional, alterações do humor, ansiedade, dificuldades relacionadas ao sono ou prejuízos em sua rotina e qualidade de vida.",
  },
  ciencia: {
    eyebrow: "Ciência",
    title: "Ciência, construção e renovação",
    quote: "Assim como a vida, conhecimento se renova",
    paragraphs: [
      "Ao conhecimento construído ao longo dos anos de prática em Psiquiatria, venho incorporando também princípios da Medicina do Estilo de Vida, que contempla, principalmente, a ciência do comportamento.",
      "Nos últimos tempos, também tenho aprofundado meus estudos na área do sono, especialmente no tratamento da insônia, integrando à prática estratégias baseadas na Terapia Cognitivo-Comportamental para Insônia (TCC-I) e na Terapia de Aceitação e Compromisso (ACT).",
      "Depois de tantos anos exercendo a Psiquiatria, continuo encontrando nela aquilo que despertou meu interesse desde o início: a possibilidade de compreender cada pessoa para além de um diagnóstico e construir, junto com ela, caminhos possíveis para viver com mais saúde, autonomia e qualidade de vida.",
    ],
  },
  consulta: {
    eyebrow: "A consulta",
    title: "Presencial em Curitiba e online.",
    intro:
      "A primeira conversa serve para entender o contexto, organizar as informações e construir, juntos, os próximos passos. Sem pressa e sem protocolo aplicado no automático.",
    steps: [
      {
        t: "Escuta e investigação",
        d: "História, momento atual, rotina, receios e o que já foi tentado. O objetivo é sair com mais clareza — não com um rótulo apressado.",
      },
      {
        t: "Caminhos possíveis",
        d: "Explico benefícios, limites e alternativas. O plano pode incluir medicação, mudanças sustentáveis e trabalho em rede com outros profissionais.",
      },
      {
        t: "Acompanhamento",
        d: "Tratamento é processo. Reavaliamos o que funciona e o que precisa ser ajustado à sua realidade.",
      },
    ],
  },
  faq: [
    {
      q: "A consulta é presencial ou online?",
      a: "As duas. Atendo em Curitiba, na Cuidar! Espaço Saúde, e também por telemedicina — com a mesma seriedade e sigilo.",
    },
    {
      q: "Qual é o público?",
      a: "Adultos que vivenciam sofrimento emocional, alterações do humor, ansiedade, dificuldades relacionadas ao sono ou prejuízos em sua rotina e qualidade de vida.",
    },
    {
      q: "Atende convênio?",
      a: "Não. Apenas consultas particulares. Entre em contato pelo WhatsApp para informações e agendamentos.",
    },
    {
      q: "Como é a primeira consulta?",
      a: "O primeiro encontro é mais longo e pode durar até 2 horas, porque conhecer a sua história faz parte do cuidado. Reserve esse tempo para conversarmos com calma sobre o que você tem vivido e, ao final, saímos com uma direção — mesmo quando algumas respostas, inclusive o diagnóstico, ainda se constroem ao longo do acompanhamento.",
    },
  ],
} as const;
