import type { Quarter, TaskKind } from "../types";

export const RITMO_SEMANAL = [
  { bloco: ".NET + arquitetura (estudo aplicado)", tempo: "6–8h" },
  { bloco: "Fidelis / leitura de design", tempo: "1–2h" },
  { bloco: "Inglês conversação", tempo: "1h" },
  { bloco: "Escrita (design doc, documentação)", tempo: "1h" },
];

export const RITMO_NOTA =
  "Total: ~10h/semana. É sustentável. Se em algum mês não der, corta o estudo — nunca o inglês, porque 1h é justamente o que impede o relógio de parar.";

export const KIND_META: Record<TaskKind, { label: string; icon: string }> = {
  estudo: { label: "Estudo complementar", icon: "📚" },
  arq: { label: "Arquitetura — Fidelis", icon: "🏛️" },
  trabalho: { label: "Trabalho", icon: "💼" },
  ingles: { label: "Inglês", icon: "🇬🇧" },
  cert: { label: "Certificação", icon: "📜" },
  check: { label: "Checkpoint", icon: "✅" },
};

export const KIND_ORDER: TaskKind[] = [
  "estudo",
  "arq",
  "trabalho",
  "cert",
  "ingles",
  "check",
];

export const quarters: Quarter[] = [
  {
    id: "t1",
    label: "T1",
    period: "set–nov/2026",
    theme: "Fundamento",
    year: 1,
    moduleIds: ["m01"],
    note: "Rodar o código, não só assistir. O módulo 1 é a base que o plano original mandava pular — agora ela vem inteira, e é justamente o que sustenta os outros 12 módulos.",
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
        text: "Escolher UM sistema que você mantém e desenhar a arquitetura dele no papel",
      },
      {
        id: "t1-trabalho-2",
        kind: "trabalho",
        text: "Achar os buracos desse sistema e anotar cada um",
      },
      {
        id: "t1-trabalho-3",
        kind: "trabalho",
        text: "Meta do trimestre: explicar esse sistema em 10 minutos para alguém de fora",
      },
      {
        id: "t1-ingles-1",
        kind: "ingles",
        text: "Contratar professor em setembro (italki ou Preply) — não adiar para \"quando sobrar\"",
      },
      {
        id: "t1-ingles-2",
        kind: "ingles",
        text: "Manter 1 aula/semana durante todo o trimestre",
      },
    ],
  },
  {
    id: "t2",
    label: "T2",
    period: "dez/2026–fev/2027",
    theme: "Profundidade e o primeiro design doc",
    year: 1,
    moduleIds: ["m02"],
    note: "Se o design doc não sai no papel, a ideia ainda está confusa — aí você estuda aquele buraco específico.",
    tasks: [
      {
        id: "t2-estudo-1",
        kind: "estudo",
        text: "Internals: performance, alocação e GC — canal do Nick Chapsas",
        url: "https://www.youtube.com/@nickchapsas",
      },
      {
        id: "t2-estudo-2",
        kind: "estudo",
        text: "Pro .NET Memory Management (Kokosa) — 1 capítulo a cada 2 semanas",
      },
      {
        id: "t2-estudo-3",
        kind: "estudo",
        text: "Benchmark de verdade em algo do seu sistema — medir antes e depois",
      },
      {
        id: "t2-arq-1",
        kind: "arq",
        text: "Fidelis — System Design, começar pelo sumário",
        url: "https://fidelissauro.dev/system-design-sumario/",
      },
      { id: "t2-arq-2", kind: "arq", text: "Capacity planning" },
      { id: "t2-arq-3", kind: "arq", text: "Single point of failure" },
      { id: "t2-arq-4", kind: "arq", text: "Observabilidade" },
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
      { id: "t2-ingles-1", kind: "ingles", text: "Manter 1h/semana" },
    ],
  },
  {
    id: "t3",
    label: "T3",
    period: "mar–mai/2027",
    theme: "Azure e escopo maior",
    year: 1,
    moduleIds: ["m03"],
    note: "⚠️ A AZ-204 foi aposentada em 31/07/2026. A alternativa dev é a AI-200, mas para o objetivo (arquitetura/Staff) o caminho AZ-104 → AZ-305 é melhor.",
    tasks: [
      {
        id: "t3-cert-1",
        kind: "cert",
        text: "AZ-104 (Azure Administrator) — 8 a 10 semanas de estudo",
        url: "https://learn.microsoft.com/credentials/certifications/",
      },
      {
        id: "t3-cert-2",
        kind: "cert",
        text: "Agendar e fazer o exame AZ-104 no fim do trimestre",
      },
      { id: "t3-arq-1", kind: "arq", text: "Fidelis — bulkheads" },
      { id: "t3-arq-2", kind: "arq", text: "Fidelis — cell-based architecture" },
      { id: "t3-arq-3", kind: "arq", text: "Fidelis — disaster recovery" },
      {
        id: "t3-trabalho-1",
        kind: "trabalho",
        text: "Assumir uma feature ponta a ponta: você desenha, decide e entrega — não pegar task pronta",
      },
      { id: "t3-ingles-1", kind: "ingles", text: "Manter 1h/semana" },
    ],
  },
  {
    id: "t4",
    label: "T4",
    period: "jun–ago/2027",
    theme: "Consolidação",
    year: 1,
    highlight: "marco",
    moduleIds: ["m04", "m05"],
    note: "Se a resposta for \"não\" em alguma pergunta do checkpoint, este trimestre é para fechar a lacuna — não para começar coisa nova.",
    tasks: [
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
    theme: "Arquitetura formal",
    year: 2,
    moduleIds: ["m06", "m07"],
    tasks: [
      {
        id: "t5-cert-1",
        kind: "cert",
        text: "AZ-305 — estudo. É expert-level, exige 3–6 meses",
        url: "https://learn.microsoft.com/credentials/certifications/",
      },
      {
        id: "t5-arq-1",
        kind: "arq",
        text: "Fidelis — capítulos restantes de System Design",
        url: "https://fidelissauro.dev/system-design-sumario/",
      },
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
    theme: "Exame e inglês em escala",
    year: 2,
    moduleIds: ["m08"],
    tasks: [
      { id: "t6-cert-1", kind: "cert", text: "AZ-305 — fazer o exame" },
      {
        id: "t6-ingles-1",
        kind: "ingles",
        text: "Subir para 3x/semana — aqui você já deve aguentar reunião",
      },
      {
        id: "t6-trabalho-1",
        kind: "trabalho",
        text: "Acompanhar vagas em dólar só para calibrar expectativa — não aplicar ainda",
      },
    ],
  },
  {
    id: "t7",
    label: "T7",
    period: "mar–mai/2028",
    theme: "Preparação de mercado",
    year: 2,
    moduleIds: ["m09", "m10"],
    note: "Saber projetar ≠ saber projetar falando inglês sob pressão. São habilidades separadas e a segunda também se treina.",
    tasks: [
      {
        id: "t7-trabalho-1",
        kind: "trabalho",
        text: "Mock interviews de system design EM INGLÊS",
      },
      {
        id: "t7-trabalho-2",
        kind: "trabalho",
        text: "Currículo e LinkedIn em inglês, com o sistema do ano 1 como peça central",
      },
      { id: "t7-ingles-1", kind: "ingles", text: "Manter 3x/semana" },
    ],
  },
  {
    id: "t8",
    label: "T8",
    period: "jun–ago/2028",
    theme: "DECISÃO",
    year: 2,
    highlight: "decisao",
    moduleIds: ["m11", "m12", "m13"],
    note: "Você chega aqui apto aos dois caminhos e escolhe com informação que hoje não tem. Não precisa decidir agora — precisa chegar aí podendo escolher.",
    tasks: [
      {
        id: "t8-check-1",
        kind: "check",
        text: "Caminho A — Staff no Brasil: negociar promoção interna ou trocar de empresa por nível",
      },
      {
        id: "t8-check-2",
        kind: "check",
        text: "Caminho B — Contractor em dólar: .NET + Azure + inglês é combinação escassa no corporativo americano/europeu",
      },
      {
        id: "t8-check-3",
        kind: "check",
        text: "Reavaliar o que ficou de fora de propósito (micro-SaaS, pós, side project)",
      },
    ],
  },
];

export const FORA_DE_PROPOSITO =
  "Micro-SaaS, side project, pós-graduação, curso de liderança, novo framework. Nada disso é ruim — todos competem com os itens acima por um tempo que você não tem. Reavaliar só depois do marco de 12 meses.";

export const REGRA_UNICA =
  "Todo estudo precisa de um objeto de aplicação. Leu sobre bulkhead? Pergunte onde encaixa no sistema que você mantém. Se não encaixa em lugar nenhum, é conhecimento de reserva — anota e segue.";

export const PRIORIDADE =
  "Ordem de prioridade: (1) .NET + arquitetura · (2) utilidade no trabalho · (3) inglês em dose mínima";
