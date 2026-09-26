import type { Material, Pilar, Trimestre } from "../types";

export const PILARES: Record<Pilar, { titulo: string; cor: string }> = {
  arquitetura: { titulo: "Arquitetura", cor: "text-accent" },
  ia: { titulo: "IA Engineering", cor: "text-measure" },
  cloud: { titulo: "Cloud", cor: "text-ok" },
  produto: { titulo: "Produto & negócio", cor: "text-decisao" },
};

export const RITMO_INICIAL = [["Formação Arquitetura — Rodrigo Branas", "2h"], ["Formação IA — Rodrigo Branas", "2h"], ["System Design — Matheus Fidelis", "1h"], ["Laboratório e documentação", "1h"]] as const;
export const RITMO_NOTA = "Referência de 6h/semana, não promessa de domínio total no prazo. Do mês 7 em diante, a hora prática pode alternar entre cloud, fundamentos de IA e produto. Inglês técnico permanece dentro da leitura, documentação e prática; não há uma sétima hora escondida.";

export const materiais: Material[] = [
  { id: "material-arq", tipo: "curso", titulo: "Formação em Arquitetura de Software — Rodrigo Branas", descricao: "Início no mês 1, em paralelo com IA. A página pública lista automação de testes, refactoring, hexagonal, Clean Architecture, DDD, microservices, eventos, CQRS, APIs e infraestrutura. O roadmap não inventa uma sequência de aulas.", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
  { id: "material-ia", tipo: "curso", titulo: "Formação em Inteligência Artificial — Rodrigo Branas", descricao: "Início no mês 1, em paralelo. Conteúdo público confirmado: LLMs, harness, context engineering, rules, skills, MCP, spec-driven development, agentes, RAG e memória. Fundamentos de Python e matemática complementam — não bloqueiam — os laboratórios.", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  { id: "material-fidelis", tipo: "livro", titulo: "System Design — Matheus Fidelis", descricao: "Leitura contínua desde o mês 1. O sumário confirmado cobre rede, storage, CAP/PACELC, dados, cache, domínios, comunicação, mensageria, escala, resiliência, observabilidade e capacidade; a leitura acompanha o problema do mês.", url: "https://fidelissauro.dev/system-design-sumario/" },
  { id: "material-revenue", tipo: "livro", titulo: "Revenue Architecture — Jacco van der Kooij", descricao: "Início sugerido no segundo semestre (mês 7). É material de receita recorrente, go-to-market e operação comercial; não é livro de arquitetura de software." },
  { id: "material-ingles", tipo: "hábito", titulo: "Inglês técnico contextual", descricao: "Ler documentação, registrar decisões e resumir aprendizados em inglês quando isso fortalecer a prática, sem ampliar a carga semanal." },
  { id: "material-az", tipo: "opcional", titulo: "Certificações Azure", descricao: "AZ-104 ou AZ-305 são opcionais após prática suficiente; não substituem projeto, decisão, operação ou evidência." },
];

const trimestre = (n: number, tema: string, dependencias: string, marco?: string): Trimestre => ({ id: `t${n}`, rotulo: `T${n}`, periodo: `meses ${(n - 1) * 3 + 1}–${n * 3}`, tema, meses: [(n - 1) * 3 + 1, (n - 1) * 3 + 2, n * 3], marco, dependencias, marcos: [{ id: `t${n}-decisao`, texto: "Registrar decisões, trade-offs e evidências do trimestre.", pilar: "geral" }, { id: `t${n}-demo`, texto: "Demonstrar o laboratório ou desenho para alguém que não o implementou.", pilar: "produto" }] });
export const trimestres = [
  trimestre(1, "Fundamentos paralelos", "Nenhuma: arquitetura, IA e cloud começam juntas."),
  trimestre(2, "Arquitetura, RAG e entrega segura", "Usa especificações e contratos do T1."),
  trimestre(3, "Escala, avaliações e descoberta", "Usa API, RAG e ambiente de testes anteriores.", "Marco 9 meses"),
  trimestre(4, "Cloud avançada e integração", "Consolida os experimentos iniciais.", "Marco 12 meses"),
  trimestre(5, "Sistemas distribuídos e plataforma", "Parte da plataforma e decisões do integrador I."),
  trimestre(6, "Operação de sistemas complexos", "Requer infraestrutura e telemetria reproduzíveis."),
  trimestre(7, "Modelos, recuperação e agentes", "Requer fundamentos de dados, RAG e segurança."),
  trimestre(8, "Plataforma de IA em cloud", "Requer evals, guardrails e práticas de operação.", "Marco 24 meses"),
  trimestre(9, "Produto, receita e influência", "Usa entrevistas, custos e evidências acumuladas."),
  trimestre(10, "Arquitetura corporativa e síntese", "Consolida artefatos sem fingir um produto corporativo pronto.", "Projeto final"),
];
