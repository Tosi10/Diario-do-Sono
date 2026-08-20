/** Copy oficial do Mapa do Sono (texto da Dra. Ana). */
export const mapaDoSono = {
  title: "Mapa do Sono",
  subtitle: "Compreendendo os padrões das suas noites",
  welcomeTitle: "Bem-vindo ao Mapa do Sono!",
  welcomeBody: [
    "Este é o seu diário do sono. Você vai registrar algumas informações simples sobre as suas noites. Com elas, poderemos conhecer melhor o seu sono, identificar padrões e pensar nas estratégias que podem ajudá-lo a dormir melhor.",
    "O Mapa do Sono é preenchido em ciclos de sete noites. O preenchimento é rápido e deve ser feito pela manhã, de preferência logo depois de acordar, enquanto as lembranças da noite ainda estão frescas.",
    "Não se preocupe em ser exato! Queremos saber como você percebeu a sua noite, e não os minutos marcados no relógio. Por isso, faça estimativas e responda da maneira que lembrar. Aqui, o relógio fica de fora.",
    "A cada noite registrada, vamos construindo um mapa um pouco mais claro do seu sono.",
  ],
  welcomeCta: "Vamos começar?",
  guideTitle: "Guia para o preenchimento",
  dateHint:
    "Registre a data (dia/mês) relativa à manhã em que está preenchendo o seu mapa do sono.",
  timeFormatHint: "Utilize o padrão de 24 horas (para não haver confusão).",
} as const;

export const formQuestions = {
  q0: {
    label: "0. A que horas você acordou?",
    hint: "Horário em que despertou pela manhã e não voltou a dormir (final do período de sono).",
  },
  q1: {
    label: "1. A que horas você saiu da cama?",
    hint: "Pode ser diferente do despertar (ex.: acordou às 6h40, saiu às 7h30).",
  },
  q2: {
    label: "2. A que horas você foi para a cama na noite passada?",
    hint: "Pode não ser a hora em que começou a tentar dormir.",
  },
  q3: {
    label: "3. A que horas você decidiu iniciar o sono?",
    hint: "Hora em que resolveu começar a tentar dormir.",
  },
  q4: {
    label: "4. Quanto tempo você levou para iniciar o sono? (min)",
    hint: "Tempo até pegar no sono a partir do horário da questão 3.",
  },
  q5: {
    label: "5. Quantas vezes você despertou ao longo do período de sono?",
    hint: "Não considere o despertar final, antes de sair da cama.",
  },
  q6: {
    label: "6. Quanto tempo durou cada despertar? (min)",
    hint: "Separe por vírgula (ex.: 10, 15). Soma = TA.",
  },
  q7: {
    label: "7. Ao todo, quanto tempo você dormiu? (minutos)",
    hint: "Estime o tempo total de sono. Ex.: 6h = 360 minutos.",
  },
  q8: {
    label: "8. Quanto de álcool você ingeriu na noite passada?",
    hint: "Ex.: 1 taça de vinho, 3 copos de cerveja, nenhum.",
  },
  q9: {
    label: "9. Quantos comprimidos você tomou para ajudá-lo a dormir?",
    hint: "Especifique dose e medicamento, se houver.",
  },
  q10: {
    label: "10. Comentários (se necessário)",
    hint: "Só informações relevantes ou situações fora do comum.",
  },
} as const;
