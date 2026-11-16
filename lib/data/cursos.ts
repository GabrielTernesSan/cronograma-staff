// Cursos da trilha: módulos das duas formações do Rodrigo Branas e cursos da Alura, cada um preso a um assunto.
// Curso é a teoria obrigatória do assunto; os artigos do assunto ficam como aprofundamento opcional.
// Os cursos têm fila própria no painel Hoje (partes com fonte "curso"): andam toda semana sem esperar o mês do assunto,
// na ordem dos assuntos por mês e, dentro do mesmo assunto, na ordem desta lista.
// O id é do módulo, não do assunto: trocar o módulo de assunto não perde o progresso.
// Duração Branas: soma das aulas que a página pública lista; aula sem duração na página conta 30 min.
// A página da Formação IA não lista aulas nem duração: cada módulo conta IA_PADRAO até ser conferido na plataforma.
// Duração Alura: a página só mostra a carga horária (vídeo + exercícios), bem maior que o vídeo
// (ex.: 89 min de vídeo para 6h); cada curso conta 40% da carga até ser conferido na plataforma.

export const FORMACOES = {
  ia: { fonte: "Formação IA · Rodrigo Branas", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  arq: { fonte: "Formação Arquitetura · Rodrigo Branas", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
  alura: { fonte: "Alura", url: "https://www.alura.com.br" },
} as const;

export type Modulo = { id: string; formacao: keyof typeof FORMACOES; titulo: string; assunto: string; minutos?: number; url?: string };

const IA_PADRAO = 180;
const ALURA = "https://www.alura.com.br/curso-online-";
/** Curso da Alura: carga anunciada em horas vira 40% em minutos. */
const alura = (id: string, titulo: string, assunto: string, carga: number, slug: string): Modulo =>
  ({ id: `alura-${id}`, formacao: "alura", titulo: `${titulo} (${carga}h na Alura)`, assunto, minutos: Math.round(carga * 60 * 0.4), url: ALURA + slug });

export const MODULOS: Modulo[] = [
  // Formação IA
  { id: "branas-ia-01", formacao: "ia", titulo: "Módulo 01 · LLMs: tipos, modelos, preço, janela de contexto, caching e modelos locais", assunto: "m08-custo-latencia", minutos: IA_PADRAO },
  { id: "branas-ia-02", formacao: "ia", titulo: "Módulo 02 · Harness: Claude Code, Codex, OpenCode, Copilot, Kiro e Antigravity", assunto: "m02-harness", minutos: IA_PADRAO },
  { id: "branas-ia-03", formacao: "ia", titulo: "Módulo 03 · Context Engineering: memória, seleção, compactação, orçamento de tokens e handoffs", assunto: "m15-contexto", minutos: IA_PADRAO },
  { id: "branas-ia-04", formacao: "ia", titulo: "Módulo 04 · Rules: AGENTS.md, CLAUDE.md, escopo e hierarquia de instruções", assunto: "m01-spec-agentes", minutos: IA_PADRAO },
  { id: "branas-ia-05", formacao: "ia", titulo: "Módulo 05 · Skills: anatomia, progressive disclosure, gatilhos, testes e distribuição", assunto: "m02-harness", minutos: IA_PADRAO },
  { id: "branas-ia-06", formacao: "ia", titulo: "Módulo 06 · MCPs: clientes, servidores, transportes, tools/resources/prompts e segurança", assunto: "m06-tools-mcp", minutos: IA_PADRAO },
  { id: "branas-ia-07", formacao: "ia", titulo: "Módulo 07 · Spec-Driven Development: PRD, specs, critérios de aceite e ciclos de verificação", assunto: "m01-spec-agentes", minutos: IA_PADRAO },
  { id: "branas-ia-08", formacao: "ia", titulo: "Módulo 08 · Construção de agentes: loop, tool calling, memória, multi-agente, evals e deploy", assunto: "m05-agentes-base", minutos: IA_PADRAO },
  { id: "branas-ia-09", formacao: "ia", titulo: "Módulo 09 · RAG: ingestão, chunking, busca híbrida, reranking, citações e avaliação", assunto: "m03-embeddings", minutos: IA_PADRAO },
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

  // Alura · IA: harness e agentes
  alura("spec-driven", "Spec-Driven Development: desenvolvimento assistido por agentes", "m01-spec-agentes", 8, "spec-driven-development-desenvolvimento-assistido-por-agentes"),
  alura("guardrails-ia", "IA na engenharia de software: guardrails de qualidade e estratégias de adoção", "m02-harness", 6, "ia-engenharia-software-guardrails-qualidade-estrategias-adocao"),
  alura("claude-python", "Claude e Python: desenvolva assistentes com a API da Anthropic", "m05-agentes-base", 8, "claude-python-desenvolva-assistentes-api-anthropic"),
  alura("protocolos-agentes", "Protocolos e arquitetura para agentes: MCP, A2A, AG-UI e Backend for Agents", "m05-agentes-base", 12, "protocolos-agentes-inteligentes"),
  alura("mcp", "Model Context Protocol (MCP): integração e otimização em agentes de IA", "m06-tools-mcp", 15, "model-context-protocol"),
  alura("seguranca-agentes", "Engenharia de software na era da IA: segurança com agentes, MCPs e código gerado por IA", "m09-owasp-llm", 10, "ia-seguranca-desenvolvimento-software"),
  // Alura · IA: evals, RAG e operação
  alura("deepeval", "Integração contínua para LLMs: avaliação de modelos com GitHub Actions e Deepeval", "m07-evals", 10, "gitactions-mlflow-deepeval"),
  alura("rag-arquiteturas", "Arquiteturas RAG com LLMs: embeddings, busca semântica e agentes com LangChain", "m03-embeddings", 8, "langchain-chatbots-rag"),
  alura("langfuse", "Observabilidade para LLMs: monitoramento e avaliação com LangFuse", "m13-otel", 12, "langfuse-observabilidade-llms"),
  alura("rag-avancado", "LangChain: técnicas avançadas de RAG", "m22-rag-avancado", 10, "langchain-rag-avancado"),
  alura("openclaw", "Agentes de IA: automação com OpenClaw e GatorClaw", "m27-openclaw", 8, "agentes-ia-openclaw"),
  // Alura · Arquitetura .NET
  alura("clean-net", "Arquitetura .NET: descomplicando a Clean Architecture", "m02-clean", 10, "arquitetura-dotnet-descomplicando-clean-architecture"),
  alura("testes-api-net", "Testes em .NET: aplicando testes de integração em APIs", "m02-testes", 6, "testes-dotnet-aplicando-testes-integracao-apis"),
  alura("testes-banco-net", "Testes em .NET: testando integração com banco de dados", "m02-testes", 6, "testes-dotnet-testando-integracao-banco-dados"),
  alura("microsservicos-net", "Microsserviços e .NET 6: implementando a comunicação", "m07-filas", 8, "microsservicos-dotnet6-implementando-comunicacao"),
  alura("arq-distribuida-net", "Arquitetura distribuída e escalável com .NET: do monolito ao Kubernetes", "m13-eventos", 6, "arquitetura-distribuida-escalavel-dotnet"),
  alura("ddd-estrategico", "Arquitetura .NET: modelando aplicações com DDD estratégico", "m03-ddd-cqrs", 10, "arquitetura-dotnet-aplicacoes-domain-driven-design-estrategico"),
  alura("ddd-tatico", "Arquitetura .NET: modelando aplicações com DDD tático", "m03-ddd-cqrs", 10, "arquitetura-dotnet-modelando-aplicacoes-domain-driven-design-tatico"),
  // Alura · Cloud: Azure e DevOps
  alura("azure-net", ".NET: soluções em nuvem com Azure na prática", "m01-containers", 5, "azure-dotnet"),
  alura("github-actions", "GitHub Actions: integrando e entregando código com segurança", "m04-cicd-segredos", 8, "github-actions-integrando-entregando-codigo-seguranca"),
  alura("otel-grafana", "Observabilidade: métricas, logs e traces com OpenTelemetry e Grafana", "m05-observabilidade", 8, "observabilidade-e-monitoramento-em-ambientes-distribuidos"),
  alura("terraform", "Terraform: gerenciar infraestrutura como código e modularizar recursos", "m03-iac", 18, "terraform-provisionando-infraestrutura-na-nuvem"),
  alura("arq-azure-net", "Arquitetura em .NET: criando uma arquitetura de sistemas no Azure", "m06-waf", 8, "arquitetura-dotnet-arquitetura-sistemas-azure"),
];

/** Nome do curso de um módulo, para agrupar o progresso: a formação do Branas inteira ou cada curso da Alura. */
export const cursoDe = (m: Modulo) => m.formacao === "alura" ? m.titulo.replace(/ \(\d+h na Alura\)$/, "") : FORMACOES[m.formacao].fonte;
