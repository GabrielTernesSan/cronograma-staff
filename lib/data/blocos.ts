import type { Bloco } from "../types";

// A espinha do plano. Cada bloco é um assunto: leitura + um projetinho isolado,
// montado do zero, que existe só para revisar aquele conceito na prática.
//
// Nenhum projetinho depende do anterior. Repetir o boilerplate é parte do
// exercício — um projeto único atravessando 30 meses vira dívida, e o conceito
// novo chega enterrado sob o acoplamento com os antigos.
//
// Este arquivo é o resumo. O conteúdo mora em `roteiro/NN-*.md`; se os dois
// discordarem, o roteiro está certo.
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
    roteiro: "roteiro/00-fundacao.md",
    projeto: {
      nome: "precos-api",
      resumo:
        "Uma API .NET 10 + Postgres do zero que guarda cotações de commodity e as devolve por período. Sem conceito de arquitetura: é a semana de tirar a ferrugem do dotnet new até o docker compose up.",
      criterio:
        "docker compose up numa máquina limpa sobe tudo, o job grava sozinho em alguns minutos, e o endpoint devolve o que foi gravado — sem passo manual entre um e outro.",
    },
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
      "Único assunto sem medição e sem leitura — não há conceito para provar, só ferramenta para destravar. Feio é aceitável. Não gastar mais de uma semana aqui.",
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
    roteiro: "roteiro/01-cache.md",
    projeto: {
      nome: "cache-lab",
      resumo:
        "Um serviço na frente de uma fonte deliberadamente lenta — um segundo serviço seu, que dorme 300ms e conta quantas vezes foi chamado. Quatro estratégias de cache montadas em cima dela e medidas uma a uma.",
      criterio:
        "Uma tabela com as 4 configurações nas linhas e as medições nas colunas, e você explica cada número sem consultar o artigo — inclusive por que o Redis ficou mais lento que o IMemoryCache e por que isso pode valer a pena.",
    },
    etapas: [
      {
        id: "b1-e1",
        texto:
          "Subir a fonte lenta com contador de chamadas e medir o serviço sem cache nenhum, sob carga",
        detalhe:
          "A fonte é sua para poder mudar a lentidão e ver o efeito — API de terceiros não te dá o contador. É a linha de base: sem ela, as outras medições não dizem nada.",
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
          "Este é o aprendizado central do assunto, não um efeito colateral: cada réplica tem o próprio cache local e elas divergem. Reproduza até conseguir explicar em voz alta.",
      },
      { id: "b1-e4", texto: "Trocar por Redis distribuído e medir" },
      { id: "b1-e5", texto: "Trocar por HybridCache (L1 + L2) e medir" },
      {
        id: "b1-e6",
        texto:
          "Provocar stampede: 500 requisições simultâneas com cache frio, antes e depois da proteção",
        detalhe:
          "Olhe o contador da fonte: sem proteção ele salta para perto de 500, com proteção fica perto de 1.",
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
        label: "Nº de chamadas que a fonte lenta recebeu em cada configuração",
      },
      { id: "b1-m3", label: "Cache hit ratio no HybridCache", unidade: "%" },
    ],
    notaObsidian:
      "“Quando cache local basta e quando não basta” — com as próprias palavras, sem copiar. Se a nota sair genérica, a etapa 3 não foi feita de verdade.",
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
    roteiro: "roteiro/02-resiliencia.md",
    projeto: {
      nome: "caos-lab",
      resumo:
        "Dois serviços: uma flaky-api com endpoint de controle (POST /modo: ok, lenta, intermitente, morta) e um cliente que precisa sobreviver a ela. Você alterna o modo de falha enquanto a carga roda.",
      criterio:
        "Com a flaky-api morta, o cliente responde rápido, com dado marcado como velho, e o endpoint que não depende dela continua normal — e você aponta qual das 7 etapas garante cada uma dessas três coisas.",
    },
    etapas: [
      {
        id: "b2-e1",
        texto: "Apontar para uma URL morta e ver o serviço inteiro cair junto",
        detalhe:
          "Ponto de partida obrigatório. Sem sentir a falha em cascata — as threads presas, o serviço inteiro parando por causa de um endpoint —, os padrões seguintes viram cerimônia.",
      },
      {
        id: "b2-e2",
        texto: "Timeout: nunca esperar indefinidamente (modo lenta)",
      },
      {
        id: "b2-e3",
        texto: "Retry com backoff (modo intermitente)",
        detalhe:
          "Depois provocar 100 falhas simultâneas e observar por que, sem jitter, todo mundo tenta ao mesmo tempo — o gráfico de chamadas na flaky-api mostra os degraus.",
      },
      {
        id: "b2-e4",
        texto: "Adicionar jitter e comparar: os degraus viram curva",
      },
      {
        id: "b2-e5",
        texto:
          "Circuit breaker: parar de bater numa dependência já reconhecida como morta",
        detalhe:
          "Meça quanto tempo até abrir e, voltando ao modo ok, quanto até fechar.",
      },
      {
        id: "b2-e6",
        texto:
          "Fallback: servir a última resposta conhecida com stale: true na resposta",
        detalhe:
          "Um Dictionary em memória basta como cache aqui — o ponto é o contrato da resposta degradada, não o armazenamento.",
      },
      {
        id: "b2-e7",
        texto:
          "Bulkhead: isolar o pool da chamada externa para que ela não consuma todas as threads",
        detalhe:
          "Prove com um segundo endpoint que não usa a flaky-api e que precisa continuar respondendo enquanto ela está morta.",
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
      "O Fidelis indica reler o capítulo de cache sob a ótica de resiliência: o assunto 1 vira insumo deste, e o fallback da etapa 6 é literalmente cache.",
    pontesTrabalho:
      "Ao terminar, classificar os BOs reais dos dois sistemas da SLC nesses padrões: quantos teriam sido evitados por timeout? Por circuit breaker? Por fallback? Quantos foram causados por um retry sem idempotência? Essa lista vira conversa com sênior, argumento de promoção e resposta de entrevista ao mesmo tempo — é o item de maior retorno do plano inteiro e custa uma tarde.",
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
          "30 perguntas de EF Core — usar como quiz de calibração no fim, não como leitura no começo",
        confirmado: true,
      },
    ],
    roteiro: "roteiro/03-persistencia.md",
    projeto: {
      nome: "bench-ef",
      resumo:
        "Uma tabela com 5 milhões de linhas e um endpoint de listagem que precisa sair de lento para rápido, medido a cada passo. O volume é o projeto: com 10 mil linhas nada disso aparece e você conclui, errado, que é teoria.",
      criterio:
        "O endpoint da etapa 2 e o da etapa 5 respondem à mesma pergunta com ordens de grandeza de diferença, e você atribui cada fatia da diferença a uma etapa específica.",
    },
    etapas: [
      {
        id: "b3-e1",
        texto: "Popular a tabela com 5 milhões de linhas (script de seed)",
        detalhe:
          "Use COPY do Postgres ou inserção em lote. Se o seed levar horas, você vai evitar recriá-lo e o projeto trava.",
      },
      {
        id: "b3-e2",
        texto:
          "Endpoint de listagem ingênuo — medir tempo e alocação de memória",
      },
      {
        id: "b3-e3",
        texto: "Aplicar AsNoTracking e medir",
        detalhe:
          "Olhe a memória alocada, não só o tempo: é lá que o snapshot aparece.",
      },
      { id: "b3-e4", texto: "Trocar por projeção com Select e medir" },
      {
        id: "b3-e5",
        texto:
          "Adicionar índice composto (commodity + data) e rodar EXPLAIN ANALYZE antes e depois",
        detalhe:
          "Depois inverta a ordem das colunas do índice e rode de novo: entender por que uma ordem serve e a outra não é metade do valor desta etapa.",
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
      "Por que a mesma query fica ordens de grandeza mais rápida — o que o EF Core estava fazendo por baixo em cada versão. Cole o SQL gerado das cinco versões: daqui a um ano ele vale mais que qualquer parágrafo.",
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
    roteiro: "roteiro/04-mensageria.md",
    projeto: {
      nome: "fila-lab",
      resumo:
        "Um produtor, um consumidor, uma fila — e um roteiro de todos os jeitos de errar, cometidos de propósito. O código de publicar e consumir cabe numa tarde; o assunto está nos quatro modos de falha, que precisam ser provocados.",
      criterio:
        "Você mata o consumidor no meio de um lote de 10 mil, sobe de novo, e termina com o número exato de registros corretos no banco — sem duplicata, sem perda — e explica qual etapa garante cada uma dessas duas coisas.",
    },
    etapas: [
      {
        id: "b4-e1",
        texto:
          "Separar ingestão de processamento: quem busca publica na fila, quem processa consome",
        detalhe:
          "Etapa trivial — dois processos e um broker no meio. Não gastar mais que uma semana nela.",
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
        detalhe:
          "Antes de configurar a DLQ, veja o que acontece sem ela — a mensagem em loop é a lição.",
      },
      {
        id: "b4-e4",
        texto: "Publicar 10 mil mensagens de uma vez e observar backpressure",
        detalhe:
          "Depois aumente o número de consumidores e veja a ordem se perder. É aqui que a teoria das filas do Fidelis encaixa.",
      },
      {
        id: "b4-e5",
        texto:
          "Padrão outbox: garantir que gravar no banco e publicar na fila não fiquem inconsistentes",
        detalhe:
          "Primeiro provoque a inconsistência — mate o processo entre o SaveChanges e o Publish — e só então implemente o outbox.",
      },
    ],
    medicoes: [
      { id: "b4-m1", label: "Throughput do consumidor", unidade: "msg/s" },
      { id: "b4-m2", label: "Tamanho máximo da fila sob carga" },
      { id: "b4-m3", label: "Nº de mensagens na DLQ e a causa de cada uma" },
    ],
    notaObsidian:
      "O que muda quando a chamada deixa de ser síncrona — o que você ganha e o que passa a ter que garantir na mão. A segunda metade é a que importa.",
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
    roteiro: "roteiro/05-observabilidade.md",
    projeto: {
      nome: "caixa-preta",
      resumo:
        "Três serviços encadeados (API → fila → consumidor), instrumentados, mais 5 a 7 scripts de sabotagem numerados que você escreve antes e executa sorteados depois. Sem o sorteio, o teste final não mede nada.",
      criterio:
        "Você acha a causa de uma sabotagem que não escolheu, em poucos minutos, sem abrir o código — e diz qual sinal te levou até lá.",
    },
    etapas: [
      {
        id: "b5-e1",
        texto:
          "Log estruturado com correlation id atravessando API → fila → consumidor",
        detalhe:
          "O correlation id tem que sobreviver ao salto pela fila; é aí que ele costuma se perder, porque não viaja sozinho no header HTTP.",
      },
      {
        id: "b5-e2",
        texto:
          "Métricas: latência, taxa de erro, cache hit ratio, tamanho da fila",
        detalhe: "São os quatro sinais dourados traduzidos para esta cadeia.",
      },
      {
        id: "b5-e3",
        texto:
          "Trace distribuído com OpenTelemetry, requisição visível ponta a ponta",
      },
      {
        id: "b5-e4",
        texto: "Health checks: liveness e readiness separados",
        detalhe:
          "Faça o readiness falhar de propósito com a dependência fora e confirme que o liveness continua verde.",
      },
      {
        id: "b5-e5",
        texto:
          "Teste final: rodar uma sabotagem sorteada e descobrir o que foi olhando só os dashboards, sem ler código",
        detalhe:
          "Esta etapa é o assunto inteiro. Se não conseguir, a observabilidade não está pronta — voltar às etapas 1 a 4, instrumentar o que faltou, e sortear outra sabotagem.",
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
      "O que você precisou olhar para achar a causa no teste final — e o que faltou estar instrumentado. A segunda metade é a lista do que você vai instrumentar de primeira no próximo sistema.",
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
    roteiro: "roteiro/06-escala.md",
    projeto: {
      nome: "carga-lab",
      resumo:
        "Um serviço simples e instrumentado — um endpoint que lê e um que escreve —, uma ferramenta de carga, e a caça ao gargalo, que muda de lugar toda vez que você resolve o anterior. Ver o gargalo mudar de lugar três vezes é o assunto.",
      criterio:
        "O capacity plan de uma página, sustentado pelas medições: quanto aguenta, o que quebra primeiro, e por que escalar horizontalmente comprou menos do que o esperado.",
    },
    etapas: [
      {
        id: "b6-e1",
        texto:
          "Teste de carga com k6 ou NBomber: achar o ponto onde o serviço degrada",
        detalhe:
          "Suba a carga em degraus. Você procura o joelho da curva, não o ponto onde tudo cai.",
      },
      {
        id: "b6-e2",
        texto:
          "Identificar o gargalo real usando as métricas do assunto 5 — banco? dependência externa? CPU?",
        detalhe:
          "Não chute. Se você não consegue provar qual recurso saturou, a etapa é instrumentar mais, não escalar.",
      },
      {
        id: "b6-e3",
        texto:
          "Escalar horizontalmente, medir de novo, verificar se o gargalo mudou de lugar",
        detalhe:
          "Ele vai mudar. A segunda rodada ensina mais que a primeira, porque agora o gargalo é compartilhado.",
      },
      {
        id: "b6-e4",
        texto: "Mapear os pontos únicos de falha do próprio desenho",
        detalhe:
          "Derrube cada um e confirme o que acontece — SPoF suposto não conta.",
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
      "Último assunto isolado. O que vem depois é o assunto 7, onde os sete se encontram — e onde o Redis que resolveu a divergência do assunto 1 vira o SPoF deste aqui.",
  },
  {
    id: "b7",
    numero: 7,
    titulo: "Integração",
    duracaoSemanas: [8, 10],
    conceitos: [
      "TTL vs invalidação por evento",
      "retry vs idempotência",
      "fallback stale vs contrato de frescor",
      "outbox vs escrita em massa",
      "cache distribuído vs SPoF",
      "correlation id ponta a ponta",
    ],
    leituras: [],
    roteiro: "roteiro/07-integracao.md",
    projeto: {
      nome: "cotacao",
      resumo:
        "O único projeto grande do plano: um serviço de cotação de ponta a ponta — ingestão resiliente, histórico consultável, eventos com garantia, leitura sob carga com cache, instrumentado e com capacity plan. Sem conceito novo: se precisar aprender algo que não está nos sete assuntos anteriores, o escopo está errado.",
      criterio:
        "O sistema roda 24h com a fonte externa sabotada em horários que você não escolheu, e no fim você mostra: nenhuma cotação perdida, nenhuma duplicada, o frescor dentro do contrato declarado — e um design doc onde cada decisão tem um número medido atrás dela.",
    },
    etapas: [
      {
        id: "b7-e1",
        texto:
          "Desenhar antes de escrever código: diagrama de uma página com o fluxo e onde cada assunto entra",
        detalhe:
          "Guarde este diagrama. A etapa 8 vai compará-lo com o que você realmente construiu, e a diferença é o aprendizado.",
      },
      {
        id: "b7-e2",
        texto:
          "Esqueleto e ingestão resiliente: timeout, retry com jitter, circuit breaker e fallback",
        detalhe:
          "A fonte externa pode ser a flaky-api do caos-lab reescrita — você vai precisar sabotá-la de novo.",
      },
      {
        id: "b7-e3",
        texto:
          "Persistência: histórico grande e a query de leitura otimizada, ainda sem cache",
        detalhe:
          "Projeção, índice composto, EXPLAIN ANALYZE. Sem cache ainda — a linha de base é a query crua.",
      },
      {
        id: "b7-e4",
        texto: "Outbox e consumidor idempotente",
        detalhe:
          "Primeiro conflito real: a escrita em massa não passa pelo change tracker e o outbox não a vê. Resolva e registre a decisão.",
      },
      {
        id: "b7-e5",
        texto: "Cache na leitura, invalidado por evento",
        detalhe:
          "Segundo conflito: TTL ou evento? Decida, implemente, e prove com medição que a decisão vale — o frescor medido é a prova.",
      },
      {
        id: "b7-e6",
        texto:
          "Instrumentar ponta a ponta e achar uma sabotagem sorteada só pelos dashboards",
        detalhe:
          "O correlation id tem que sobreviver ao cache hit, ao retry, ao salto pela fila e ao outbox.",
      },
      {
        id: "b7-e7",
        texto: "Teste de carga e capacity plan do sistema inteiro",
        detalhe:
          "Terceiro conflito: o Redis agora é SPoF. Derrube-o sob carga e veja o que o sistema faz.",
      },
      {
        id: "b7-e8",
        texto:
          "Design doc de 2 páginas, comparado com o diagrama da etapa 1",
        detalhe:
          "Arquitetura, decisões, trade-offs, limites — cada afirmação sustentada por uma medição registrada. Termine dizendo o que você desenhou errado na etapa 1, e por quê.",
      },
    ],
    medicoes: [
      {
        id: "b7-m1",
        label: "Latência p99 da leitura com o sistema inteiro ligado",
        unidade: "ms",
      },
      {
        id: "b7-m2",
        label:
          "Frescor: da cotação chegar na fonte até ficar visível na leitura",
        unidade: "s",
      },
      {
        id: "b7-m3",
        label: "Taxa de erro e frescor com a fonte externa morta por 30 min",
        unidade: "% / min",
      },
      {
        id: "b7-m4",
        label: "RPS máximo do sistema inteiro e qual componente saturou",
        unidade: "req/s",
      },
      {
        id: "b7-m5",
        label:
          "Os conflitos entre padrões que você resolveu, e a decisão de cada um",
      },
    ],
    notaObsidian:
      "Onde os sete assuntos se contradisseram e como você decidiu. As outras seis notas são de sênior — dizem que você entende um conceito. Esta é de Staff: diz que você sabe escolher entre dois conceitos certos que não cabem juntos, e justificar com um número.",
    observacao:
      "Sem leitura nova: releia as próprias notas dos sete assuntos anteriores antes de desenhar. Se alguma estiver vaga a ponto de não ajudar aqui, aquele assunto não fechou de verdade — volte ao projetinho dele. Este é o único projeto que reaproveita: não o código, as decisões.",
    pontesTrabalho:
      "O cotacao e o design doc dele são a peça central do currículo, do LinkedIn e das mock interviews do T9. Não é portfólio decorativo: é o material sobre o qual você vai ser entrevistado, com números para sustentar cada frase. “Por que vocês usaram X?” raramente tem resposta boa; “por que X em vez de Y, sabendo que custaria Z” tem — e é essa que você vai ter escrito.",
  },
];

export const blocoById = new Map(blocos.map((b) => [b.id, b]));

export const ALL_ETAPAS = blocos.flatMap((b) => b.etapas);
export const ALL_MEDICOES = blocos.flatMap((b) => b.medicoes);

export const MUKESH_BLOG_URL = "https://codewithmukesh.com/blog/";
export const FIDELIS_URL = "https://fidelissauro.dev/system-design-sumario/";

// Preencha com a URL do repositório (ex. "https://github.com/user/repo/blob/main/")
// e os caminhos de `roteiro` viram links clicáveis no card de cada bloco. Vazio,
// o caminho aparece como texto — melhor que um link morto.
export const REPO_BLOB_URL =
  "https://github.com/GabrielTernesSan/cronograma-staff/blob/main/";
