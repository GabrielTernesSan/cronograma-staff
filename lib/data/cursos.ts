import type { TipoLeitura } from "../types";

// Cursos da trilha: módulos das duas formações do Rodrigo Branas e cursos da Alura, cada um preso a um assunto.
// Curso é a teoria obrigatória do assunto; os artigos do assunto ficam como aprofundamento opcional.
// Os cursos têm fila própria no painel Hoje (partes com fonte "curso"): andam toda semana sem esperar o mês do assunto,
// na ordem dos assuntos por mês e, dentro do mesmo assunto, na ordem desta lista.
// O id é do módulo, não do assunto: trocar o módulo de assunto não perde o progresso.
// Duração Branas: soma das aulas que a página pública lista; aula sem duração na página conta 30 min.
// Formação IA: módulos e aulas conferidos na plataforma (nov/2026); sem duração na plataforma, cada aula conta 30 min.
// Ids são o contrato do progresso: RAG, Second Brain, OpenClaw e Hermes mantêm branas-ia-09, 10, 11 e 12, com o mesmo tema.
// A divisão em sessões (~sN) mudou com as aulas da plataforma; nenhuma sessão desses módulos tinha sido oferecida pela fila
// (eles vêm bem depois dos módulos 01–08 na ordem dos assuntos), então não há sessão salva com o significado antigo.
// Leituras em português: entram na fila no lugar dos módulos já feitos, como teoria do assunto; cada uma conta MIN_LEITURA.artigo min.
// Duração Alura: a página só mostra a carga horária (vídeo + exercícios), bem maior que o vídeo
// (ex.: 89 min de vídeo para 6h); cada curso conta 40% da carga até ser conferido na plataforma.

// curto: nome para listas apertadas. url: página do curso; a das leituras é vazia (cada leitura tem o seu link, de autores diferentes).
export const FORMACOES = {
  ia: { fonte: "Formação IA · Rodrigo Branas", curto: "Formação IA", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  arq: { fonte: "Formação Arquitetura · Rodrigo Branas", curto: "Formação Arquitetura", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
  alura: { fonte: "Alura", curto: "Alura", url: "https://www.alura.com.br" },
  leitura: { fonte: "Leituras em português", curto: "Leitura", url: "" },
} as const;

// curso: nome do curso da Alura (cada um é um curso); nos do Branas o curso é a formação. fonte: autor de uma leitura.
export type Modulo = { id: string; formacao: keyof typeof FORMACOES; titulo: string; assunto: string; minutos?: number; url?: string; curso?: string; fonte?: string };

const AULA = 30;
/** Módulo da Formação IA: número e nome da plataforma, aulas na ordem; 30 min por aula. */
const ia = (id: string, n: number, nome: string, aulas: string[], assunto: string): Modulo =>
  ({ id: `branas-ia-${id}`, formacao: "ia", titulo: `Módulo ${String(n).padStart(2, "0")} · ${nome}: ${aulas.join("; ")}`, assunto, minutos: aulas.length * AULA });
const ALURA = "https://www.alura.com.br/curso-online-";
/** Curso da Alura: carga anunciada em horas vira 40% em minutos. */
const alura = (id: string, titulo: string, assunto: string, carga: number, slug: string): Modulo =>
  ({ id: `alura-${id}`, formacao: "alura", titulo: `${titulo} (${carga}h na Alura)`, curso: titulo, assunto, minutos: Math.round(carga * 60 * 0.4), url: ALURA + slug });
// Tempo estimado de leitura por tipo (fica aqui porque trilha.ts importa este arquivo e as leituras da fila também usam).
export const MIN_LEITURA: Record<TipoLeitura, number> = { artigo: 40, doc: 60, curso: 180, livro: 120, ferramenta: 30, "vídeo": 60 };
/** Leitura em português (autor e link próprios): entra na fila de cursos como teoria do assunto. */
const pt = (id: string, titulo: string, autor: string, url: string, assunto: string): Modulo =>
  ({ id: `pt-${id}`, formacao: "leitura", titulo, fonte: autor, assunto, minutos: MIN_LEITURA.artigo, url });

export const MODULOS: Modulo[] = [
  // Formação IA
  // Módulos 01–10 (Mercado, LLM, Harness, Context Engineering, Rules, Skills, MCPs, Spec-Driven Development,
  // Construção de Agentes e Mastra) já estavam feitos na plataforma em nov/2026: saíram da fila e no lugar deles
  // entram as leituras em português do fim desta lista.
  // O módulo 13 (Agentes Autônomos) está dividido em duas partes: a geral e o OpenClaw no assunto do OpenClaw,
  // o Hermes no assunto do Hermes (que de outro modo ficaria sem teoria).
  ia("09", 11, "RAG", ["introdução", "ingestão de fontes", "técnicas de chunking", "embedding", "storage (bancos vetoriais)", "pergunta e top k", "reranking", "RRF com BM25", "conectando o RAG na LLM", "multi-query"], "m03-embeddings"),
  ia("10", 12, "Second Brain", ["o problema da gestão de conhecimento", "LLM Wiki", "processo no AGENTS.md", "INGEST", "QUERY: anúncios", "QUERY: artigos de blog", "QUERY: landing page", "LINT"], "m25-second-brain"),
  { id: "branas-ia-live-llm-wiki", formacao: "ia", titulo: "Live · Second Brain usando LLM Wiki (Pedro Nauck)", assunto: "m25-second-brain", minutos: 60 },
  ia("11", 13, "Agentes Autônomos (parte 1)", ["um pouco sobre a história", "comparação com outras ferramentas", "complexidade arquitetural", "visão geral: OpenClaw"], "m27-openclaw"),
  ia("12", 13, "Agentes Autônomos (parte 2)", ["visão geral: Hermes", "instalação do Hermes", "Slack no Hermes", "Linear no Hermes"], "m29-hermes"),

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

  // Leituras em português no lugar dos módulos 01–10 da Formação IA, já feitos na plataforma
  // LLM
  pt("limites-llms", "Os limites das LLMs", "Fabio Akita", "https://ailair.akitaonrails.com/pt-br/limits/", "m08-custo-latencia"),
  pt("benchmark-multimodelo", "LLM Benchmarks parte 2: vale combinar múltiplos modelos no mesmo projeto?", "Fabio Akita", "https://akitaonrails.com/2026/04/18/llm-benchmarks-parte-2-multiplos-modelos/", "m08-custo-latencia"),
  // Harness e Skills
  pt("o-que-e-harness", "Harness: o que é, como funciona e por que virou a palavra de 2026", "Alura", "https://www.alura.com.br/artigos/o-que-e-harness", "m02-harness"),
  pt("harness-bullshit", "Hot take: Harness, Loop Engineering, Graph Engineering são bullshit", "Fabio Akita", "https://akitaonrails.com/2026/08/18/hot-take-harness-loop-engineering-graph-engineering-sao-bullshit/", "m02-harness"),
  pt("toolkit-akita", "Dicas e toolkit de IA do Akita: ai-jail, ai-memory, ai-usagebar", "Fabio Akita", "https://akitaonrails.com/2026/05/24/dicas-e-toolkit-de-ia-do-akita-ai-jail-ai-memory-ai-usagebar/", "m02-harness"),
  pt("agents-ou-skills", "Agents ou Skills: qual escolher?", "balta.io", "https://balta.io/articles/agents-ou-skills-qual-escolher", "m02-harness"),
  // Context Engineering
  pt("ai-memory", "Novidades no meu AI-MEMORY: contexto que atravessa Claude Code, Codex e opencode", "Fabio Akita", "https://akitaonrails.com/2026/07/20/novidades-no-meu-ai-memory-cada-vez-melhor-pra-usar-com-suas-ias/", "m15-contexto"),
  // Rules e Spec-Driven Development
  pt("guia-claude-code", "Claude Code: guia completo de como programar com IA", "Alura", "https://www.alura.com.br/artigos/o-que-e-claude-code", "m01-spec-agentes"),
  // MCPs
  pt("o-que-e-mcp", "O que é MCP (Model Context Protocol)?", "balta.io", "https://balta.io/articles/o-que-e-mcp", "m06-tools-mcp"),
  pt("agents-ou-mcp", "Agents ou MCP: qual escolher?", "balta.io", "https://balta.io/articles/agents-ou-mcp-qual-escolher", "m06-tools-mcp"),
  pt("mcp-go", "Criando um MCP Server usando Go", "Elton Minetto", "https://eltonminetto.dev/post/2025-05-01-mcp-server-golang/", "m06-tools-mcp"),
  // Construção de Agentes e Mastra
  pt("o-que-sao-agents", "O que são Agents?", "balta.io", "https://balta.io/articles/o-que-sao-agents", "m05-agentes-base"),
  pt("agentes-desafio-zig", "AI Agents: comparando as principais LLMs de 2026 no desafio de Zig", "Fabio Akita", "https://akitaonrails.com/2026/01/11/ai-agents-comparando-as-principais-llm-no-desafio-de-zig/", "m05-agentes-base"),
  pt("agentes-llms", "Como agentes potencializam a performance das LLMs", "Alura", "https://www.alura.com.br/artigos/como-agentes-podem-ajudar-llms", "m05-agentes-base"),
];


/** De onde vem o módulo, para mostrar: autor da leitura ou nome da formação. */
export const fonteDe = (m: Modulo) => m.fonte ?? FORMACOES[m.formacao].fonte;
/** Fonte curta, para listas apertadas: autor da leitura ou nome curto da formação. */
export const fonteCurtaDe = (m: Modulo) => m.fonte ?? FORMACOES[m.formacao].curto;
/** Link do módulo: o próprio (curso da Alura, leitura) ou a página da formação. */
export const urlDe = (m: Modulo) => m.url ?? FORMACOES[m.formacao].url;

/** Nome do curso de um módulo, para agrupar o progresso: a formação do Branas inteira ou cada curso da Alura. */
export const cursoDe = (m: Modulo) => m.curso ?? FORMACOES[m.formacao].fonte;
