import type { Destino, Marco, Material, Pilar, Trimestre } from "../types";

export const PILARES: Record<Pilar, { titulo: string; cor: string }> = {
  arquitetura: { titulo: "Arquitetura", cor: "text-accent" },
  ia: { titulo: "IA Engineering", cor: "text-measure" },
  cloud: { titulo: "Cloud", cor: "text-ok" },
  ingles: { titulo: "Inglês", cor: "text-decisao" },
  carreira: { titulo: "Carreira & mudança", cor: "text-warn" },
};

export const ROTA = [
  { codigo: "GRU", quando: "hoje", texto: "trabalhando no Brasil" },
  { codigo: "REMOTO", quando: "mês 24", texto: "contrato em USD/EUR" },
  { codigo: "EU", quando: "mês 36", texto: "Blue Card ou Tech Visa" },
] as const;

export const RITMO = [
  ["Formação Arquitetura — Rodrigo Branas + System Design (Fidelis)", "2h"],
  ["Formação IA — Rodrigo Branas + laboratório", "2h"],
  ["Cloud e plataforma (Azure, IaC, observabilidade)", "1h"],
  ["Inglês: 4×30 min de conversação + escrita técnica", "2h"],
  ["Carreira: portfólio, LinkedIn, entrevistas, documentos", "1h"],
] as const;
export const RITMO_NOTA = "Referência de 8h/semana. O plano anterior tinha 6h e deixava o inglês dentro das outras horas; para sair do país isso não fecha, porque inglês falado e preparação de entrevista precisam de horas próprias. No ano 2, durante a busca de vaga (meses 19–24), a hora de cloud pode virar hora de entrevista.";

export const MERCADO_DADOS = [
  "IA virou requisito básico: aparece em 42% das descrições de vaga de software em 2026, contra 8% em 2022.",
  "O mercado sênior se dividiu. Generalista full-stack sênior enfrenta buscas longas; especialista em infraestrutura e plataforma de IA continua escasso.",
  "Fora dos laboratórios de fronteira, quase ninguém treina modelo base. O trabalho está em avaliações, recuperação (RAG), agentes, observabilidade e custo.",
  "Quem contrata quer ver um produto pequeno entregue de ponta a ponta, medido contra uma baseline, com escolhas de modelo, custo e arquitetura defendidas. Evals são tratados como os testes unitários da IA.",
  "Plataforma, DevOps e segurança ganharam demanda com a IA; contratação de júnior encolheu.",
];
export const MERCADO_LEITURA = [
  "O trabalho do sênior sai de escrever código para especificar, delegar a agentes, verificar e assinar embaixo. Quem define critério de aceite e eval vale mais do que quem digita rápido.",
  "Com menos júniores sendo formados, sêniores de verdade ficam mais raros em 2028–2029. Isso favorece quem chegar lá com evidência pública.",
  "Empresas europeias tradicionais (banco, seguro, indústria, governo) rodam muito .NET e Azure e precisam pôr IA em produção com auditoria e AI Act. É um nicho bom para esse perfil e menos disputado que AI engineer de startup americana.",
  "Título-alvo: Senior Software Engineer (AI Platform) ou Senior Backend Engineer (.NET, Azure, LLM). Arquiteto vem depois, já lá fora.",
];
export const MERCADO_FONTES = [
  ["CoderCops — Software engineer job market 2026", "https://blog.codercops.com/blog/software-engineer-job-market-2026-data"],
  ["KORE1 — Senior SWE glut and AI infra drought", "https://kore1.com/senior-swe-glut-ai-infra-drought-2026/"],
  ["Hiring AI engineers in 2026", "https://www.callmissed.com/blog/hiring-ai-engineers-2026"],
  ["How to get an AI engineer job in 2026", "https://www.louisbouchard.ai/what-i-look-for-when-hiring-ai-engineers/"],
  ["Embaixada da Alemanha — EU Blue Card 2026", "https://www.germany.info/resource/blob/2435484/ffe411670fb3aa496edfb1a77e7136f2/eu-blue-card-data.pdf"],
  ["Kroes Advocaten — Highly skilled migrant 2026", "https://www.kroesadvocaten.nl/en/highly-skilled-migrant-salary-threshold-2026/"],
] as const;

export const DESTINOS: Destino[] = [
  { pais: "Alemanha", via: "EU Blue Card (TI)", minimo: "€45.934/ano", pros: "Aceita 3+ anos de experiência em TI nos últimos 7 sem diploma; Berlim funciona em inglês", contras: "Alemão pesa fora de Berlim; burocracia" },
  { pais: "Holanda", via: "Highly Skilled Migrant", minimo: "€5.942/mês (30+)", pros: "Processo rápido via empresa patrocinadora; muito inglês", contras: "Moradia cara e difícil" },
  { pais: "Portugal", via: "Tech Visa / procura de trabalho", minimo: "—", pros: "Idioma, comunidade brasileira grande, porta para a UE", contras: "Salários baixos; regras para CPLP apertaram em 2026" },
  { pais: "Plano B", via: "Remoto do Brasil", minimo: "—", pros: "Moeda forte sem mudar; vira reserva", contras: "Não resolve a saída; atenção a impostos PJ" },
];
export const DESTINOS_NOTA = "Mínimos brutos de 2026 exigidos para o visto. Sobem todo janeiro; o laboratório M25 manda conferir de novo nas fontes oficiais.";

export const materiais: Material[] = [
  { id: "material-arq", tipo: "curso", titulo: "Formação em Arquitetura de Software — Rodrigo Branas", descricao: "Início no mês 1, em paralelo com IA. A página pública lista automação de testes, refactoring, hexagonal, Clean Architecture, DDD, microservices, eventos, CQRS, APIs e infraestrutura. O roadmap não inventa uma sequência de aulas.", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
  { id: "material-ia", tipo: "curso", titulo: "Formação em Inteligência Artificial — Rodrigo Branas", descricao: "Início no mês 1, em paralelo. Conteúdo público confirmado: LLMs, harness, context engineering, rules, skills, MCP, spec-driven development, agentes, RAG e memória. Fundamentos de Python e matemática complementam, sem bloquear, os laboratórios.", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  { id: "material-fidelis", tipo: "livro", titulo: "System Design — Matheus Fidelis", descricao: "Leitura contínua desde o mês 1 e base para as entrevistas de system design do ano 2. Cobre rede, storage, CAP/PACELC, dados, cache, mensageria, escala, resiliência, observabilidade e capacidade.", url: "https://fidelissauro.dev/system-design-sumario/" },
  { id: "material-richards-ford", tipo: "livro", titulo: "Fundamentals of Software Architecture — Mark Richards e Neal Ford", descricao: "Leitura contínua a partir do mês 1, junto com o assunto Fundamentos de arquitetura. Base de características arquiteturais, estilos, modularidade e trade-offs; volte aos capítulos de cada estilo quando ele aparecer na trilha.", url: "https://fundamentalsofsoftwarearchitecture.com/" },
  { id: "material-akita", tipo: "livro", titulo: "Competente o Suficiente — Fabio Akita", descricao: "Livro gratuito (EPUB e PDF, em português e inglês) de 2026 sobre IA na prática, montado a partir dos posts do blog: o que é, se funciona, como ler benchmarks, riscos de dar acesso a agentes e o impacto no emprego. Ler em paralelo nos meses 1–6; a Parte V entra no M12. Os posts do blog aparecem como leituras nos assuntos de agentes, benchmarks e segurança.", url: "https://ailair.akitaonrails.com/book/" },
  { id: "material-ingles", tipo: "hábito", titulo: "Inglês falado e escrito", descricao: "2h por semana com horário próprio: 4 sessões de 30 minutos de conversação com professor ou parceiro, mais READMEs, ADRs e posts em inglês. Meta B2+ no mês 10, C1 em entrevista no ano 3." },
  { id: "material-nivel", tipo: "teste", titulo: "Teste de nível de inglês", descricao: "EF SET ou equivalente no mês 1, no mês 11 e no ano 3. A nota entra como evidência; não depende de impressão." },
  { id: "material-az", tipo: "opcional", titulo: "Certificações Azure", descricao: "AZ-104 ou AZ-305 são opcionais após prática suficiente; ajudam a passar filtro de RH na Europa, mas não substituem projeto, decisão, operação ou evidência." },
  { id: "material-revenue", tipo: "opcional", titulo: "Revenue Architecture — Jacco van der Kooij", descricao: "Saiu do caminho principal: é material de receita e go-to-market e não pesa em entrevista sênior de engenharia. Fica como leitura livre." },
];

const base = (n: number): Marco[] => [
  { id: `t${n}-decisao`, texto: "Registrar decisões, trade-offs e evidências do trimestre.", pilar: "geral" },
  { id: `t${n}-ingles`, texto: "Publicar em inglês o resumo do trimestre (README, post ou vídeo).", pilar: "ingles" },
];
const trimestre = (n: number, tema: string, dependencias: string, marco?: string, extra: string[] = []): Trimestre => ({
  id: `t${n}`, rotulo: `T${n}`, periodo: `meses ${(n - 1) * 3 + 1}–${n * 3}`, tema, meses: [(n - 1) * 3 + 1, (n - 1) * 3 + 2, n * 3], marco, dependencias,
  marcos: [...base(n), ...extra.map((texto, i) => ({ id: `t${n}-x${i + 1}`, texto, pilar: "carreira" as const }))],
});
export const trimestres = [
  trimestre(1, "Especificação, Clean Architecture e IA", "Nenhuma: arquitetura, IA e cloud começam juntas.", undefined, ["Teste de nível de inglês feito e nota registrada.", "Repositório público criado com README em inglês."]),
  trimestre(2, "RAG, cloud e agentes com aprovação", "Usa especificações e contratos do T1.", undefined, ["LinkedIn e GitHub em inglês com título-alvo definido."]),
  trimestre(3, "Escala, evals e segurança", "Usa API, RAG e ambiente de testes anteriores.", undefined, ["6 histórias STAR em inglês com números reais."]),
  trimestre(4, "Cloud, portfólio e Integrador I", "Consolida o ano.", "Marco ano 1", ["Inglês B2+ comprovado em teste.", "5 candidaturas remotas de calibragem com perguntas anotadas."]),
  trimestre(5, "Sistemas distribuídos e plataforma", "Parte do Integrador I."),
  trimestre(6, "Plataforma de IA e Integrador II", "Requer evals, observabilidade e segurança.", undefined, ["Um PR aceito em projeto open source de IA ou .NET."]),
  trimestre(7, "Entrevistas e busca ativa", "Usa portfólio e integradores.", undefined, ["Pipeline com 3 a 5 candidaturas qualificadas por semana."]),
  trimestre(8, "Contrato remoto e preparação da saída", "Depende de processo seletivo em andamento.", "Marco ano 2 · contrato remoto", ["Contrato remoto internacional assinado.", "Reserva para 12 meses do destino em andamento."]),
  trimestre(9, "Visto, governança e idioma", "Usa documentos e destino do T8."),
  trimestre(10, "Legado, comunicação e oferta", "Processos com relocation em andamento.", undefined, ["Oferta com visto assinada."]),
  trimestre(11, "Modelos abertos, visto e saída fiscal", "Depende da oferta do T10.", undefined, ["Visto aprovado."]),
  trimestre(12, "Chegada e próximo nível", "Mudança concluída.", "Marco ano 3 · mudança", ["Morando fora com visto de trabalho."]),
];
