import type { Bloco } from "../types";

// A espinha do plano. Cada bloco é um conceito com escopo de projeto aplicado
// em cima do mesmo serviço de cotação de commodity construído no bloco 0.
//
// ⚠️ IDs são posicionais (`b1-e3` = 3ª etapa do bloco 1). Reordenar ou remover
// no meio de uma lista faz o progresso salvo apontar para o item errado.
// Para acrescentar, adicione no fim do array.
//
// `confirmado: false` numa leitura = endereço ainda não verificado no blog.

export const blocos: Bloco[] = [
  {
    id: "b0",
    numero: 0,
    titulo: "Fundação",
    duracaoSemanas: [1, 1],
    conceitos: [],
    leituras: [],
    etapas: [
      { id: "b0-e1", texto: "API .NET 10 + PostgreSQL + EF Core rodando" },
      {
        id: "b0-e2",
        texto:
          "Job agendado que busca cotação de commodity numa API pública e grava",
      },
      { id: "b0-e3", texto: "Endpoint de consulta por commodity e período" },
    ],
    medicoes: [],
    observacao:
      "Sem conceito, só esqueleto. Critério: roda e persiste — feio é aceitável. Não gastar mais de uma semana aqui; este bloco existe para os outros seis terem onde rodar.",
  },
  {
    id: "b1",
    numero: 1,
    titulo: "Cache",
    duracaoSemanas: [3, 4],
    conceitos: [
      "cache-aside",
      "write-through",
      "TTL",
      "invalidação",
      "stampede",
      "cache local vs distribuído",
      "identity map",
      "cache hit ratio",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Cache",
        url: "https://fidelissauro.dev/caching/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "In-Memory Caching em ASP.NET Core",
        url: "https://codewithmukesh.com/blog/in-memory-caching-in-aspnet-core/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "Distributed Caching com Redis",
        confirmado: true,
      },
      { fonte: "mukesh", titulo: "HybridCache", confirmado: true },
      {
        fonte: "mukesh",
        titulo: "EF Core Second-Level Caching",
        confirmado: true,
      },
    ],
    etapas: [
      {
        id: "b1-e1",
        texto: "Medir o endpoint de consulta sem cache nenhum, sob carga",
        detalhe:
          "É a linha de base. Sem ela, as outras medições não dizem nada.",
      },
      {
        id: "b1-e2",
        texto: "Adicionar IMemoryCache com GetOrCreateAsync e medir de novo",
      },
      {
        id: "b1-e3",
        texto:
          "Subir 2 réplicas em Docker e observar a inconsistência entre elas",
        detalhe:
          "Este é o aprendizado central do bloco, não um efeito colateral: cada réplica tem o próprio cache local e elas divergem.",
      },
      { id: "b1-e4", texto: "Trocar por Redis distribuído e medir" },
      { id: "b1-e5", texto: "Trocar por HybridCache (L1 + L2) e medir" },
      {
        id: "b1-e6",
        texto:
          "Provocar stampede: 500 requisições simultâneas com cache frio, antes e depois da proteção",
      },
    ],
    medicoes: [
      {
        id: "b1-m1",
        label: "Latência p50 e p99 nas 4 configurações",
        unidade: "ms",
      },
      {
        id: "b1-m2",
        label: "Nº de chamadas que a API externa recebeu em cada configuração",
      },
      { id: "b1-m3", label: "Cache hit ratio no HybridCache", unidade: "%" },
    ],
    notaObsidian:
      "“Quando cache local basta e quando não basta” — com as próprias palavras, sem copiar.",
  },
  {
    id: "b2",
    numero: 2,
    titulo: "Resiliência",
    duracaoSemanas: [4, 5],
    conceitos: [
      "timeout",
      "retry",
      "backoff exponencial",
      "jitter",
      "circuit breaker",
      "fallback",
      "bulkhead",
      "degradação graciosa",
      "idempotência",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Resiliência",
        url: "https://fidelissauro.dev/resiliencia/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "Polly · resilience pipelines · HttpClient resiliente",
        confirmado: false,
      },
    ],
    etapas: [
      {
        id: "b2-e1",
        texto: "Apontar para uma URL morta e ver o serviço inteiro cair junto",
        detalhe:
          "Ponto de partida obrigatório. Sem sentir a falha em cascata, os padrões seguintes viram cerimônia.",
      },
      { id: "b2-e2", texto: "Timeout: nunca esperar indefinidamente" },
      {
        id: "b2-e3",
        texto: "Retry com backoff",
        detalhe:
          "Depois provocar 100 falhas simultâneas e observar por que, sem jitter, todo mundo tenta ao mesmo tempo.",
      },
      { id: "b2-e4", texto: "Adicionar jitter e comparar" },
      {
        id: "b2-e5",
        texto:
          "Circuit breaker: parar de bater numa dependência já reconhecida como morta",
      },
      {
        id: "b2-e6",
        texto:
          "Fallback: servir a última cotação do cache com stale: true na resposta",
      },
      {
        id: "b2-e7",
        texto:
          "Bulkhead: isolar o pool da chamada externa para que ela não consuma todas as threads",
      },
    ],
    medicoes: [
      {
        id: "b2-m1",
        label:
          "Taxa de erro do serviço com a dependência morta — antes e depois de cada padrão",
        unidade: "%",
      },
      { id: "b2-m2", label: "Latência p99 durante a falha", unidade: "ms" },
      {
        id: "b2-m3",
        label: "Tempo até o circuit breaker abrir e fechar",
        unidade: "s",
      },
    ],
    notaObsidian:
      "O que cada padrão protege e o que ele não protege — timeout, retry, circuit breaker e fallback resolvem falhas diferentes.",
    observacao:
      "O Fidelis indica reler o capítulo de cache sob a ótica de resiliência: o bloco 1 vira insumo deste.",
    pontesTrabalho:
      "Ao terminar, classificar os BOs reais dos dois sistemas da SLC nesses padrões: quantos teriam sido evitados por timeout? Por circuit breaker? Por fallback? Essa lista vira conversa com sênior, argumento de promoção e resposta de entrevista ao mesmo tempo — é o item de maior retorno do plano inteiro.",
  },
  {
    id: "b3",
    numero: 3,
    titulo: "Persistência e performance",
    duracaoSemanas: [4, 5],
    conceitos: [
      "change tracking",
      "snapshot",
      "projeção",
      "N+1",
      "índice",
      "plano de execução",
      "operações em lote",
      "paginação",
      "transação",
      "lazy vs eager loading",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Databases",
        url: "https://fidelissauro.dev/databases/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "Tracking vs No-Tracking (AsNoTrackingWithIdentityResolution)",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "10 erros de performance no EF Core",
        confirmado: true,
      },
      { fonte: "mukesh", titulo: "Bulk Operations", confirmado: true },
      { fonte: "mukesh", titulo: "EF Core Interceptors", confirmado: true },
      {
        fonte: "mukesh",
        titulo:
          "30 perguntas de EF Core — usar como quiz de calibração, não como leitura",
        confirmado: true,
      },
    ],
    etapas: [
      {
        id: "b3-e1",
        texto: "Popular o histórico com 5 milhões de linhas (script de seed)",
      },
      {
        id: "b3-e2",
        texto:
          "Endpoint de listagem ingênuo — medir tempo e alocação de memória",
      },
      { id: "b3-e3", texto: "Aplicar AsNoTracking e medir" },
      { id: "b3-e4", texto: "Trocar por projeção com Select e medir" },
      {
        id: "b3-e5",
        texto:
          "Adicionar índice composto (commodity + data) e rodar EXPLAIN ANALYZE antes e depois",
      },
      {
        id: "b3-e6",
        texto: "Criar um N+1 de propósito, encontrá-lo no log de SQL, corrigir",
      },
      {
        id: "b3-e7",
        texto: "Job de atualização em massa: ExecuteUpdate vs carregar-e-salvar",
      },
    ],
    medicoes: [
      {
        id: "b3-m1",
        label: "Tempo e memória alocada nas etapas 2, 3 e 4",
        unidade: "ms / MB",
      },
      {
        id: "b3-m2",
        label: "Nº de queries geradas antes e depois da correção do N+1",
      },
      {
        id: "b3-m3",
        label:
          "Custo do plano de execução no Postgres, antes e depois do índice",
      },
      {
        id: "b3-m4",
        label: "Tempo do job em massa nas duas abordagens",
        unidade: "s",
      },
    ],
    notaObsidian:
      "Por que a mesma query fica ordens de grandeza mais rápida — o que o EF Core estava fazendo por baixo em cada versão.",
  },
  {
    id: "b4",
    numero: 4,
    titulo: "Mensageria e eventos",
    duracaoSemanas: [4, 5],
    conceitos: [
      "produtor/consumidor",
      "idempotência",
      "dead letter queue",
      "ordenação",
      "at-least-once vs exactly-once",
      "backpressure",
      "outbox",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Comunicação assíncrona e teoria das filas",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "RabbitMQ · MassTransit · background services",
        confirmado: false,
      },
    ],
    etapas: [
      {
        id: "b4-e1",
        texto:
          "Separar ingestão de processamento: quem busca publica na fila, quem processa consome",
      },
      {
        id: "b4-e2",
        texto:
          "Publicar a mesma mensagem duas vezes de propósito, ver o dado duplicar, implementar idempotência por chave",
      },
      {
        id: "b4-e3",
        texto:
          "Fazer o consumidor lançar exceção, configurar DLQ, inspecionar o que caiu lá",
      },
      {
        id: "b4-e4",
        texto: "Publicar 10 mil mensagens de uma vez e observar backpressure",
      },
      {
        id: "b4-e5",
        texto:
          "Padrão outbox: garantir que gravar no banco e publicar na fila não fiquem inconsistentes",
      },
    ],
    medicoes: [
      { id: "b4-m1", label: "Throughput do consumidor", unidade: "msg/s" },
      { id: "b4-m2", label: "Tamanho máximo da fila sob carga" },
      { id: "b4-m3", label: "Nº de mensagens na DLQ e a causa de cada uma" },
    ],
    notaObsidian:
      "O que muda quando a chamada deixa de ser síncrona — o que você ganha e o que passa a ter que garantir na mão.",
    observacao:
      "RabbitMQ já está na sua stack e no seu LinkedIn. Aqui você passa a entender o que hoje usa por convenção.",
  },
  {
    id: "b5",
    numero: 5,
    titulo: "Observabilidade",
    duracaoSemanas: [3, 3],
    conceitos: [
      "log estruturado",
      "correlation id",
      "métrica",
      "trace distribuído",
      "health check",
      "os quatro sinais dourados",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Observabilidade (via sumário de System Design)",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
      },
      {
        fonte: "mukesh",
        titulo: "Serilog · OpenTelemetry · Health Checks",
        confirmado: false,
      },
    ],
    etapas: [
      {
        id: "b5-e1",
        texto:
          "Log estruturado com correlation id atravessando API → fila → consumidor",
      },
      {
        id: "b5-e2",
        texto:
          "Métricas: latência, taxa de erro, cache hit ratio, tamanho da fila",
      },
      {
        id: "b5-e3",
        texto:
          "Trace distribuído com OpenTelemetry, requisição visível ponta a ponta",
      },
      { id: "b5-e4", texto: "Health checks: liveness e readiness separados" },
      {
        id: "b5-e5",
        texto:
          "Teste final: quebrar algo de propósito e descobrir o que foi olhando só os dashboards, sem ler código",
        detalhe:
          "Esta etapa é o bloco inteiro. Se não conseguir, a observabilidade não está pronta — voltar às etapas 1 a 4.",
      },
    ],
    medicoes: [
      {
        id: "b5-m1",
        label: "Tempo até identificar a causa no teste final",
        unidade: "min",
      },
      { id: "b5-m2", label: "Nº de sinais que precisou olhar para chegar lá" },
    ],
    notaObsidian:
      "O que você precisou olhar para achar a causa no teste final — e o que faltou estar instrumentado.",
  },
  {
    id: "b6",
    numero: 6,
    titulo: "Escala e capacidade",
    duracaoSemanas: [4, 4],
    conceitos: [
      "capacity planning",
      "teoria das filas",
      "gargalo",
      "escala horizontal vs vertical",
      "SPoF",
      "degradação sob carga",
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Performance, capacidade e escalabilidade",
        url: "https://fidelissauro.dev/performance-capacidade-escalabilidade/",
        confirmado: true,
      },
      {
        fonte: "fidelis",
        titulo: "SPoF, bulkheads e cell-based architecture (via sumário)",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
      },
    ],
    etapas: [
      {
        id: "b6-e1",
        texto:
          "Teste de carga com k6 ou NBomber: achar o ponto onde o serviço degrada",
      },
      {
        id: "b6-e2",
        texto:
          "Identificar o gargalo real usando as métricas do bloco 5 — banco? API externa? CPU?",
      },
      {
        id: "b6-e3",
        texto:
          "Escalar horizontalmente, medir de novo, verificar se o gargalo mudou de lugar",
      },
      {
        id: "b6-e4",
        texto: "Mapear os pontos únicos de falha do próprio desenho",
      },
      {
        id: "b6-e5",
        texto:
          "Escrever o capacity plan: quantas req/s aguenta e o que quebra primeiro ao passar disso",
      },
    ],
    medicoes: [
      { id: "b6-m1", label: "RPS máximo antes da degradação", unidade: "req/s" },
      {
        id: "b6-m2",
        label: "RPS máximo depois da escala horizontal",
        unidade: "req/s",
      },
      { id: "b6-m3", label: "Onde estava o gargalo em cada rodada" },
    ],
    notaObsidian:
      "Onde estava o gargalo, por que ele mudou de lugar ao escalar, e qual é o limite honesto do desenho.",
    observacao:
      "Entregável final do projeto inteiro: design doc de 2 páginas — arquitetura, decisões, trade-offs, limites conhecidos. É a peça que fecha o projeto e a que se mostra em entrevista.",
  },
];

export const blocoById = new Map(blocos.map((b) => [b.id, b]));

export const ALL_ETAPAS = blocos.flatMap((b) => b.etapas);
export const ALL_MEDICOES = blocos.flatMap((b) => b.medicoes);

export const MUKESH_BLOG_URL = "https://codewithmukesh.com/blog/";
export const FIDELIS_URL = "https://fidelissauro.dev/system-design-sumario/";
