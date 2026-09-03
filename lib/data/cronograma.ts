import type { Quarter, TaskKind, Trilha } from "../types";

// A conta das 6h semanais: 4h de projetinho, 1h de leitura de arquitetura, 1h de
// inglês. Um trimestre tem ~13 semanas, logo ~52h de projetinho por trimestre.
export const RITMO_SEMANAL = [
  { bloco: "Assunto corrente — o projetinho", tempo: "4h" },
  { bloco: "Leitura de arquitetura — Fidelis", tempo: "1h" },
  { bloco: "Inglês conversação", tempo: "1h" },
];

export const RITMO_NOTA =
  "Total: 6h/semana. Os 7 primeiros assuntos custam ~315h — a 4h/semana são ~78 semanas, 18 meses só de projetinho. Somando certificações, preparação de mercado e folga, o plano ocupa 10 trimestres. Não é atraso: o plano de 24 meses supunha 10h/semana e o curso do Mukesh como espinha. Com 6h e foco em arquitetura aplicada, 30 meses é o número honesto. O assunto 7, o projeto grande do fim, custa mais ~36h e ocupa o T8.";

export const KIND_META: Record<TaskKind, { label: string; icon: string }> = {
  arq: { label: "Arquitetura — Fidelis", icon: "🏛️" },
  trabalho: { label: "Trabalho", icon: "💼" },
  cert: { label: "Certificação", icon: "📜" },
  ingles: { label: "Inglês", icon: "🇬🇧" },
  ia: { label: "IA — Rodrigo Branas", icon: "🤖" },
  check: { label: "Checkpoint", icon: "✅" },
};

export const KIND_ORDER: TaskKind[] = [
  "arq",
  "trabalho",
  "cert",
  "ingles",
  "ia",
  "check",
];

export const quarters: Quarter[] = [
  {
    id: "t1",
    label: "T1",
    period: "set–nov/2026",
    theme: "Fundamento e cache",
    year: 1,
    blocoIds: ["b0", "b1"],
    note: "O assunto 0 não passa de uma semana. O resto do trimestre é o assunto 1 inteiro — e o aprendizado central dele é ver duas réplicas discordarem, não configurar Redis.",
    tasks: [
      {
        id: "t1-arq-1",
        kind: "arq",
        text: "STAR — comunicação executiva",
        url: "https://fidelissauro.dev/star/",
      },
      {
        id: "t1-arq-2",
        kind: "arq",
        text: "Navalha de Ockham",
        url: "https://fidelissauro.dev/navalha-de-ockham/",
      },
      {
        id: "t1-arq-3",
        kind: "arq",
        text: "Staff Smart Methods",
        url: "https://fidelissauro.dev/staff-smart-methods/",
      },
      {
        id: "t1-trabalho-1",
        kind: "trabalho",
        text: "Desenhar no papel a arquitetura de um dos sistemas da SLC — não depende do projeto, dá para fazer já",
      },
      {
        id: "t1-trabalho-2",
        kind: "trabalho",
        text: "Achar os buracos desse sistema e anotar cada um",
      },
      {
        id: "t1-trabalho-3",
        kind: "trabalho",
        text: "Classificar os últimos 10 BOs em 5 categorias: requisito, arquitetura, bug, infra, prazo",
      },
      {
        id: "t1-trabalho-4",
        kind: "trabalho",
        text: "Meta do trimestre: explicar esse sistema em 10 minutos para alguém de fora",
      },
      {
        id: "t1-ingles-1",
        kind: "ingles",
        text: "Contratar professor em setembro (italki ou Preply) — não adiar para “quando sobrar”",
      },
      {
        id: "t1-ingles-2",
        kind: "ingles",
        text: "Manter 1h/semana durante todo o trimestre",
      },
    ],
  },
  {
    id: "t2",
    label: "T2",
    period: "dez/2026–fev/2027",
    theme: "Resiliência e o primeiro design doc",
    year: 1,
    blocoIds: ["b2"],
    note: "Se o design doc não sai no papel, a ideia ainda está confusa — aí você estuda aquele buraco específico. O assunto 2 custa ~60h contra 52h de capacidade: transbordar ~2 semanas para o T3 é previsto, não falha.",
    tasks: [
      {
        id: "t2-trabalho-1",
        kind: "trabalho",
        text: "MARCO: escrever um design doc de 1 página para uma decisão técnica real",
      },
      {
        id: "t2-trabalho-2",
        kind: "trabalho",
        text: "Apresentar esse design doc para o time",
      },
      {
        id: "t2-trabalho-3",
        kind: "trabalho",
        text: "Propor a trilha de estudo por senioridade — item de clima que já virou iniciativa",
      },
      { id: "t2-ingles-1", kind: "ingles", text: "Manter 1h/semana" },
    ],
  },
  {
    id: "t3",
    label: "T3",
    period: "mar–mai/2027",
    theme: "Persistência e performance",
    year: 1,
    blocoIds: ["b3"],
    transbordoIds: ["b2"],
    tasks: [
      {
        id: "t3-trabalho-1",
        kind: "trabalho",
        text: "Assumir uma feature ponta a ponta: você desenha, decide e entrega — não pegar task pronta",
      },
      {
        id: "t3-trabalho-2",
        kind: "trabalho",
        text: "Classificar os BOs reais dos dois sistemas nos padrões de resiliência do assunto 2",
      },
      { id: "t3-ingles-1", kind: "ingles", text: "Manter 1h/semana" },
    ],
  },
  {
    id: "t4",
    label: "T4",
    period: "jun–ago/2027",
    theme: "Consolidação e AZ-104",
    year: 1,
    highlight: "marco",
    highlightLabel: "MARCO 12 MESES",
    blocoIds: [],
    transbordoIds: ["b3"],
    note: "Trimestre sem assunto novo, de propósito: absorve o atraso acumulado do ano 1 e cabe a AZ-104. Se tudo correu no prazo, sobra tempo — e sobra é recurso, não desperdício. Se a resposta for “não” em alguma pergunta do checkpoint, este trimestre é para fechar a lacuna.",
    tasks: [
      {
        id: "t4-cert-1",
        kind: "cert",
        text: "AZ-104 (Azure Administrator) — 8 a 10 semanas de estudo",
        url: "https://learn.microsoft.com/credentials/certifications/",
      },
      {
        id: "t4-cert-2",
        kind: "cert",
        text: "Agendar e fazer o exame AZ-104 no fim do trimestre",
      },
      {
        id: "t4-check-1",
        kind: "check",
        text: "Responder por escrito: sou sênior de fato ou só de tempo de casa?",
      },
      {
        id: "t4-check-2",
        kind: "check",
        text: "Responder por escrito: tenho um sistema que desenhei e sei explicar?",
      },
      {
        id: "t4-check-3",
        kind: "check",
        text: "Responder por escrito: escrevi pelo menos 2 design docs que alguém leu?",
      },
      {
        id: "t4-trabalho-1",
        kind: "trabalho",
        text: "Documentar o que você construiu — vira material de promoção e de entrevista ao mesmo tempo",
      },
      {
        id: "t4-ingles-1",
        kind: "ingles",
        text: "Subir de 1h para 2h/semana — o técnico já está sólido o bastante para liberar banda",
      },
    ],
  },
  {
    id: "t5",
    label: "T5",
    period: "set–nov/2027",
    theme: "Mensageria e eventos",
    year: 2,
    blocoIds: ["b4"],
    tasks: [
      {
        id: "t5-trabalho-1",
        kind: "trabalho",
        text: "Liderar tecnicamente um projeto com mais de uma pessoa",
      },
      { id: "t5-ingles-1", kind: "ingles", text: "Manter 2h/semana" },
    ],
  },
  {
    id: "t6",
    label: "T6",
    period: "dez/2027–fev/2028",
    theme: "Observabilidade e início da AZ-305",
    year: 2,
    blocoIds: ["b5"],
    transbordoIds: ["b4"],
    tasks: [
      {
        id: "t6-cert-1",
        kind: "cert",
        text: "AZ-305 — começar o estudo. É expert-level, exige 3–6 meses",
        url: "https://learn.microsoft.com/credentials/certifications/",
      },
      { id: "t6-ingles-1", kind: "ingles", text: "Manter 2h/semana" },
    ],
  },
  {
    id: "t7",
    label: "T7",
    period: "mar–mai/2028",
    theme: "Escala e capacidade",
    year: 2,
    blocoIds: ["b6"],
    tasks: [
      { id: "t7-cert-1", kind: "cert", text: "AZ-305 — fazer o exame" },
      { id: "t7-ingles-1", kind: "ingles", text: "Manter 2h/semana" },
    ],
  },
  {
    id: "t8",
    label: "T8",
    period: "jun–ago/2028",
    theme: "Assunto 7 — o sistema inteiro",
    year: 2,
    highlight: "marco",
    highlightLabel: "MARCO 24 MESES",
    blocoIds: ["b7"],
    note: "O único projeto grande do plano: os sete assuntos viram um sistema só, e é aí que eles se contradizem. São 8–10 semanas contra ~13 de trimestre — a folga é a mesma que absorveria o atraso do ano 2. Se o ano 2 escorregou, o assunto 7 entra no T9, e isso não atrapalha: as mock interviews do T9 são sobre ele.",
    tasks: [
      {
        id: "t8-trabalho-1",
        kind: "trabalho",
        text: "Apresentar o design doc do cotacao ao time — a etapa 8 do assunto 7 escreve, esta aqui defende em voz alta",
      },
      {
        id: "t8-trabalho-2",
        kind: "trabalho",
        text: "Acompanhar vagas em dólar só para calibrar expectativa — não aplicar ainda",
      },
      {
        id: "t8-ingles-1",
        kind: "ingles",
        text: "Subir para 3h/semana — aqui você já deve aguentar reunião",
      },
    ],
  },
  {
    id: "t9",
    label: "T9",
    period: "set–nov/2028",
    theme: "Preparação de mercado",
    year: 3,
    blocoIds: [],
    note: "Saber projetar ≠ saber projetar falando inglês sob pressão. São habilidades separadas e a segunda também se treina.",
    tasks: [
      {
        id: "t9-trabalho-1",
        kind: "trabalho",
        text: "Mock interviews de system design EM INGLÊS",
      },
      {
        id: "t9-trabalho-2",
        kind: "trabalho",
        text: "Currículo e LinkedIn em inglês, com o cotacao e o design doc dele como peça central",
      },
      { id: "t9-ingles-1", kind: "ingles", text: "Manter 3h/semana" },
    ],
  },
  {
    id: "t10",
    label: "T10",
    period: "dez/2028–fev/2029",
    theme: "DECISÃO",
    year: 3,
    highlight: "decisao",
    highlightLabel: "PONTO DE DECISÃO",
    blocoIds: [],
    note: "Você chega aqui apto aos dois caminhos e escolhe com informação que hoje não tem. Não precisa decidir agora — precisa chegar aí podendo escolher.",
    tasks: [
      {
        id: "t10-check-1",
        kind: "check",
        text: "Caminho A — Staff no Brasil: negociar promoção interna ou trocar de empresa por nível",
      },
      {
        id: "t10-check-2",
        kind: "check",
        text: "Caminho B — Contractor em dólar: .NET + Azure + inglês é combinação escassa no corporativo americano/europeu",
      },
      {
        id: "t10-check-3",
        kind: "check",
        text: "Reavaliar o que ficou de fora de propósito (micro-SaaS, pós, side project)",
      },
    ],
  },
];

// Correm fora dos trimestres e não competem com os assuntos na barra principal.
// As que têm `kind` derivam o progresso dos marcos espalhados pela grade —
// assim nenhum ID de marco existe em dois lugares.
export const trilhas: Trilha[] = [
  {
    id: "tr-ia",
    titulo: "Curso de IA — Rodrigo Branas",
    icon: "🤖",
    regra: "Pago pela empresa, ritmo próprio. Se começar a consumir as 6h semanais inteiras, o projetinho corrente para — e isso precisa ser uma decisão consciente, não um deslize.",
    itens: [
      {
        id: "tr-ia-1",
        kind: "ia",
        text: "Definir quantas horas semanais o curso vai ocupar, e de onde elas saem",
      },
      { id: "tr-ia-2", kind: "ia", text: "Concluir o curso" },
      {
        id: "tr-ia-3",
        kind: "ia",
        text: "Aplicar uma coisa do curso no projeto ou num sistema da SLC",
      },
    ],
  },
  {
    id: "tr-ingles",
    titulo: "Inglês",
    icon: "🇬🇧",
    kind: "ingles",
    regra: "1h/semana fixo, sobe para 2h após o marco de 12 meses e 3h no ano 2. Nunca é o primeiro item a ser cortado numa semana ruim — 1h é justamente o que impede o relógio de parar.",
  },
  {
    id: "tr-cert",
    titulo: "Certificação Azure",
    icon: "📜",
    kind: "cert",
    regra: "AZ-104 → AZ-305. Sem data fixa: entra quando um assunto terminar e antes do próximo começar.",
    aviso: "A AZ-204 foi aposentada em 31/07/2026. Para o objetivo de arquitetura/Staff, o caminho AZ-104 → AZ-305 é melhor que a alternativa dev.",
  },
  {
    id: "tr-trabalho",
    titulo: "Trabalho",
    icon: "💼",
    kind: "trabalho",
    regra: "O que dá para fazer sem depender do projeto: desenhar a arquitetura de um sistema da SLC, classificar BOs, escrever design doc e apresentar ao time.",
  },
];

export const FORA_DE_PROPOSITO =
  "Micro-SaaS, side project, pós-graduação, curso de liderança, novo framework. Nada disso é ruim — todos competem com os itens acima por um tempo que você não tem. Reavaliar só depois do marco de 12 meses.";

export const REGRA_UNICA =
  "Etapa cortada é medição não feita. Se um assunto escorregar mais que as ~2 semanas previstas, o ajuste é empurrar a grade — nunca cortar etapa.";

export const PRIORIDADE =
  "Ordem de prioridade: (1) o assunto corrente · (2) utilidade no trabalho · (3) inglês em dose mínima";
