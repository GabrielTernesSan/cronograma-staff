// Módulos das duas formações do Rodrigo Branas, encaixados nos assuntos da trilha.
// Cada módulo entra como leitura do assunto (vídeo) e vai para a fila do painel Hoje no mês desse assunto.
// O id é do módulo, não do assunto: trocar o módulo de assunto não perde o progresso.
// Duração: soma das aulas que a página pública lista; aula sem duração na página conta 30 min.
// A página da Formação IA não lista aulas nem duração: cada módulo conta IA_PADRAO até ser conferido na plataforma.

export const FORMACOES = {
  ia: { fonte: "Formação IA · Rodrigo Branas", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  arq: { fonte: "Formação Arquitetura · Rodrigo Branas", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
} as const;

export type Modulo = { id: string; formacao: keyof typeof FORMACOES; titulo: string; assunto: string; minutos?: number };

const IA_PADRAO = 180;

export const MODULOS: Modulo[] = [
  // Formação IA
  { id: "branas-ia-01", formacao: "ia", titulo: "Módulo 01 · LLMs: tipos, modelos, preço, janela de contexto, caching e modelos locais", assunto: "m08-custo-latencia", minutos: IA_PADRAO },
  { id: "branas-ia-02", formacao: "ia", titulo: "Módulo 02 · Harness: Claude Code, Codex, OpenCode, Copilot, Kiro e Antigravity", assunto: "m02-harness", minutos: IA_PADRAO },
  { id: "branas-ia-03", formacao: "ia", titulo: "Módulo 03 · Context Engineering: memória, seleção, compactação, orçamento de tokens e handoffs", assunto: "m15-contexto", minutos: IA_PADRAO },
  { id: "branas-ia-04", formacao: "ia", titulo: "Módulo 04 · Rules: AGENTS.md, CLAUDE.md, escopo e hierarquia de instruções", assunto: "m15-contexto", minutos: IA_PADRAO },
  { id: "branas-ia-05", formacao: "ia", titulo: "Módulo 05 · Skills: anatomia, progressive disclosure, gatilhos, testes e distribuição", assunto: "m02-harness", minutos: IA_PADRAO },
  { id: "branas-ia-06", formacao: "ia", titulo: "Módulo 06 · MCPs: clientes, servidores, transportes, tools/resources/prompts e segurança", assunto: "m06-tools-mcp", minutos: IA_PADRAO },
  { id: "branas-ia-07", formacao: "ia", titulo: "Módulo 07 · Spec-Driven Development: PRD, specs, critérios de aceite e ciclos de verificação", assunto: "m01-spec-agentes", minutos: IA_PADRAO },
  { id: "branas-ia-08", formacao: "ia", titulo: "Módulo 08 · Construção de agentes: loop, tool calling, memória, multi-agente, evals e deploy", assunto: "m05-agentes-base", minutos: IA_PADRAO },
  { id: "branas-ia-09", formacao: "ia", titulo: "Módulo 09 · RAG: ingestão, chunking, busca híbrida, reranking, citações e avaliação", assunto: "m04-rag-base", minutos: IA_PADRAO },
  { id: "branas-ia-10", formacao: "ia", titulo: "Módulo 10 · Second Brain: captura, curadoria, busca semântica e memória entre agentes", assunto: "m25-second-brain", minutos: IA_PADRAO },
  { id: "branas-ia-11", formacao: "ia", titulo: "Módulo 11 · OpenClaw: gateway, runtime, canais, automações agendadas e agentes 24/7", assunto: "m27-openclaw", minutos: IA_PADRAO },
  { id: "branas-ia-12", formacao: "ia", titulo: "Módulo 12 · Hermes: modelos, loop de aprendizado, memória persistente, subagentes e MCP", assunto: "m29-hermes", minutos: IA_PADRAO },

  // Formação Arquitetura
  { id: "branas-arq-01", formacao: "arq", titulo: "Módulo 01 · Automação de testes: fundamentos, FIRST e TDD, unit/integration/E2E", assunto: "m02-testes", minutos: 155 },
  { id: "branas-arq-04", formacao: "arq", titulo: "Módulo 04 · Test Patterns: stub, spy, mock e fake", assunto: "m02-testes", minutos: 108 },
  { id: "branas-arq-12b", formacao: "arq", titulo: "Módulo 12 · Infraestrutura: GitHub Actions e CI", assunto: "m04-cicd-segredos", minutos: 30 },
  { id: "branas-arq-09", formacao: "arq", titulo: "Módulo 09 · SOLID: SRP, OCP, LSP, ISP e DIP", assunto: "m07-solid", minutos: 150 },
  { id: "branas-arq-12a", formacao: "arq", titulo: "Módulo 12 · Infraestrutura: containers com Docker e Docker Compose", assunto: "m01-containers", minutos: 30 },
  { id: "branas-arq-03", formacao: "arq", titulo: "Módulo 03 · Arquitetura Hexagonal: fundamentos e ports and adapters com SOLID", assunto: "m02-clean", minutos: 89 },
  { id: "branas-arq-05", formacao: "arq", titulo: "Módulo 05 · Clean Architecture: entities, use cases, interface adapters, frameworks e pastas", assunto: "m02-clean", minutos: 319 },
  { id: "branas-arq-10", formacao: "arq", titulo: "Módulo 10 · APIs: REST, GraphQL e gRPC", assunto: "m09-api-rest", minutos: 90 },
  { id: "branas-arq-12d", formacao: "arq", titulo: "Módulo 12 · Infraestrutura: Terraform", assunto: "m03-iac", minutos: 30 },
  { id: "branas-arq-07b", formacao: "arq", titulo: "Módulo 07 · Microservices: retry e fallback", assunto: "m07-idempotencia", minutos: 60 },
  { id: "branas-arq-07a", formacao: "arq", titulo: "Módulo 07 · Microservices: fundamentos, decomposição em bounded contexts e event-driven", assunto: "m13-eventos", minutos: 171 },
  { id: "branas-arq-07c", formacao: "arq", titulo: "Módulo 07 · Microservices: SAGA e transactional outbox", assunto: "m13-consistencia", minutos: 60 },
  { id: "branas-arq-12c", formacao: "arq", titulo: "Módulo 12 · Infraestrutura: tipos (on-premise a FaaS) e serviços da AWS", assunto: "m17-aws-base", minutos: 60 },
  { id: "branas-arq-06", formacao: "arq", titulo: "Módulo 06 · Domain-Driven Design: estratégico e tático, do bounded context aos domain events", assunto: "m03-ddd-cqrs", minutos: 442 },
  { id: "branas-arq-07d", formacao: "arq", titulo: "Módulo 07 · Microservices: command/handler e CQRS", assunto: "m03-ddd-cqrs", minutos: 60 },
  { id: "branas-arq-08a", formacao: "arq", titulo: "Módulo 08 · Design Patterns criacionais: factory method, abstract factory, builder, prototype e singleton", assunto: "m24-patterns-estrutura", minutos: 207 },
  { id: "branas-arq-08b", formacao: "arq", titulo: "Módulo 08 · Design Patterns estruturais: adapter, bridge, composite, decorator, facade, flyweight e proxy", assunto: "m24-patterns-estrutura", minutos: 259 },
  { id: "branas-arq-08c", formacao: "arq", titulo: "Módulo 08 · Design Patterns comportamentais (chain of responsibility a visitor) e repository", assunto: "m25-patterns-comportamento", minutos: 375 },
  { id: "branas-arq-11", formacao: "arq", titulo: "Módulo 11 · Frontend: fundamentos de arquitetura, Vue.js, React e Angular", assunto: "m26-frontend", minutos: 120 },
  { id: "branas-arq-02", formacao: "arq", titulo: "Módulo 02 · Refactoring: fundamentos, code smells e técnicas", assunto: "m28-legado", minutos: 101 },
];
