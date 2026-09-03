import type { Bloco } from "../types";

// O conteúdo do roteiro. Cada bloco é um assunto: leitura + um projetinho
// isolado, montado do zero, que existe só para revisar aquele conceito na
// prática. O assunto 7 é a exceção — nele os sete se encontram.
//
// Este arquivo é o que o site renderiza. `roteiro/NN-*.md` é a cópia portátil,
// para ler no GitHub ou no Obsidian: mesmo conteúdo, dois formatos. Mexeu aqui,
// mexa lá.
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
    intro: [
      "Este é o único assunto sem conceito de arquitetura. Ele existe para tirar a ferrugem: subir uma API .NET moderna do zero, com banco, sem copiar de projeto antigo.",
      "Se você já faz isso de olhos fechados no trabalho, faça mesmo assim — mas em uma semana, não mais. O ganho aqui é confirmar que o caminho do dotnet new até o docker compose up é conhecido, porque os seis assuntos seguintes começam todos por ele.",
    ],
    conceitosTitulo: "O que se pratica",
    conceitos: [
      {
        termo: "Minimal API vs Controllers",
        definicao: "Qual você escolhe e por quê, não qual é melhor.",
      },
      {
        termo: "EF Core migrations",
        definicao: "O ciclo de criar e aplicar migration sem consultar.",
      },
      {
        termo: "Docker Compose",
        definicao: "Subir aplicação e banco juntos com um comando.",
      },
      {
        termo: "Configuração e secrets",
        definicao: "Connection string fora do código, desde o primeiro dia.",
      },
    ],
    leituras: [],
    leiturasNota:
      "Nada. Este assunto é execução. Se travar em alguma peça, procure no blog do Mukesh o artigo daquela peça específica — mas procurar já é o custo. Não estude por antecipação.",
    roteiro: "roteiro/00-fundacao.md",
    projeto: {
      nome: "precos-api",
      resumo:
        "Uma API que guarda cotações de commodity e as devolve por período.",
      porque:
        "É o esqueleto mais barato que exercita as quatro peças que todos os outros projetinhos vão precisar: HTTP, banco relacional, um job que roda sozinho, e tudo em containers. O domínio foi escolhido por ser próximo do seu trabalho e não exigir inventar regra de negócio — se preferir outro, troque.",
      entra:
        "Um agregado (Cotacao: commodity, data, preço, fonte), um endpoint de consulta, um job agendado que busca de uma API pública e grava, docker compose com Postgres.",
      foraDe:
        "Autenticação, testes, validação elaborada, camadas, CQRS, tratamento de erro sofisticado, front-end. Feio é aceitável aqui. Se você está pensando em arquitetura limpa nesta semana, está no assunto errado.",
      criterio:
        "docker compose up numa máquina limpa sobe tudo, o job grava sozinho em alguns minutos, e o endpoint devolve o que foi gravado. Sem passo manual entre um e outro.",
    },
    etapas: [
      {
        id: "b0-e1",
        texto: "API .NET 10 + PostgreSQL + EF Core rodando",
        detalhe:
          "Um docker compose up sobe aplicação e banco; a migration cria a tabela sozinha na subida.",
      },
      {
        id: "b0-e2",
        texto:
          "Job agendado que busca cotação de commodity numa API pública e grava",
        detalhe:
          "Um BackgroundService com PeriodicTimer basta. Se a API pública exigir chave, use outra fonte — não gaste a semana em cadastro.",
      },
      {
        id: "b0-e3",
        texto: "Endpoint de consulta por commodity e período",
        detalhe: "GET /cotacoes?commodity=soja&de=…&ate=…",
      },
    ],
    medicoes: [],
    medicoesNota:
      "Nenhuma. Este é o único assunto sem medição — não há conceito para provar, só ferramenta para destravar.",
    notaObsidian:
      "Não escreva nota conceitual aqui. Escreva a lista de coisas em que você travou e quanto tempo cada uma custou — o docker compose, a connection string, a migration. Essa lista é a sua linha de base de ferramental e vale reler antes do assunto 1.",
    observacao:
      "Único assunto sem medição e sem leitura. Não gastar mais de uma semana aqui: este assunto existe para os outros terem onde começar.",
  },
  {
    id: "b1",
    numero: 1,
    titulo: "Cache",
    duracaoSemanas: [3, 4],
    intro: [
      "O primeiro assunto de arquitetura de verdade. Cache é o lugar onde a intuição erra mais: quase todo mundo sabe pôr um IMemoryCache e quase ninguém sabe dizer quando ele deixa de servir.",
      "O aprendizado central deste assunto não é configurar Redis — é ver duas réplicas discordarem e entender por que isso acontece.",
    ],
    conceitos: [
      {
        termo: "cache-aside",
        definicao:
          "A aplicação consulta o cache e só vai à fonte se não achar. É o padrão default; os outros são exceções a ele.",
      },
      {
        termo: "write-through",
        definicao:
          "A escrita passa pelo cache e pela fonte juntas. Troca latência de escrita por consistência de leitura.",
      },
      {
        termo: "TTL",
        definicao:
          "Por quanto tempo o dado vale. É a decisão mais consequente e a mais tomada no chute: TTL é a sua tolerância a dado velho, medida em segundos.",
      },
      {
        termo: "invalidação",
        definicao:
          "Expulsar o dado antes do TTL, quando a fonte mudou. O difícil não é expulsar — é saber que mudou.",
      },
      {
        termo: "stampede",
        definicao:
          "O cache expira e mil requisições vão à fonte ao mesmo tempo. O cache que existia para proteger a fonte é quem a derruba.",
      },
      {
        termo: "cache local vs distribuído",
        definicao:
          "Local é rápido e mente; distribuído é consistente e custa uma ida na rede. Entender esse trade-off é o assunto inteiro.",
      },
      {
        termo: "identity map",
        definicao:
          "Dentro da mesma unidade de trabalho, a mesma entidade é o mesmo objeto. É cache de escopo curtíssimo — o EF Core já faz por você (volta no assunto 3).",
      },
      {
        termo: "cache hit ratio",
        definicao:
          "A fração de acertos. Sozinho não diz nada: 99% de hit num dado que podia ser errado é pior que 60% num dado correto.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Cache",
        url: "https://fidelissauro.dev/caching/",
        confirmado: true,
        nota: "A teoria e o vocabulário. Leia antes de escrever qualquer código.",
      },
      {
        fonte: "mukesh",
        titulo: "In-Memory Caching em ASP.NET Core",
        url: "https://codewithmukesh.com/blog/in-memory-caching-in-aspnet-core/",
        confirmado: true,
        nota: "IMemoryCache, GetOrCreateAsync, políticas de expiração.",
      },
      {
        fonte: "mukesh",
        titulo: "Distributed Caching com Redis",
        confirmado: true,
        nota: "IDistributedCache e o que muda ao sair do processo.",
      },
      {
        fonte: "mukesh",
        titulo: "HybridCache",
        confirmado: true,
        nota: "A API do .NET 9+ que junta L1 e L2 e resolve stampede por padrão.",
      },
      {
        fonte: "mukesh",
        titulo: "EF Core Second-Level Caching",
        confirmado: true,
        nota: "Leitura de contexto: onde o cache encosta no ORM. Volta no assunto 3.",
      },
    ],
    roteiro: "roteiro/01-cache.md",
    projeto: {
      nome: "cache-lab",
      resumo:
        "Um serviço com uma fonte deliberadamente lenta, na frente da qual você monta quatro estratégias de cache diferentes e mede as quatro.",
      porque:
        "Cache só faz sentido contra latência — e contra latência que você controla. Por isso a fonte não é uma API pública: é um segundo serviço seu, que dorme 300ms antes de responder e conta quantas vezes foi chamado. Esse contador é a medição mais importante do assunto, e uma API de terceiros nunca te daria.",
      entra:
        "O serviço de leitura, a fonte lenta com contador, quatro configurações de cache (nenhum, IMemoryCache, Redis, HybridCache), duas réplicas em Docker, e um gerador de carga simples.",
      foraDe:
        "Escrita, invalidação por evento, banco de dados, autenticação, domínio interessante. O dado pode ser { id, valor } — quanto mais burro, melhor.",
      criterio:
        "Você tem uma tabela com as quatro configurações nas linhas e as medições nas colunas, e consegue explicar cada número sem consultar o artigo — inclusive por que o Redis ficou mais lento que o IMemoryCache e por que isso pode valer a pena.",
    },
    etapas: [
      {
        id: "b1-e1",
        texto:
          "Subir a fonte lenta e o serviço de leitura, e medir sem cache nenhum, sob carga",
        detalhe:
          "A fonte dorme 300ms e expõe quantas chamadas recebeu. Esta é a linha de base — sem ela, todas as outras medições não dizem nada.",
      },
      {
        id: "b1-e2",
        texto: "Adicionar IMemoryCache com GetOrCreateAsync e medir de novo",
        detalhe:
          "Compare latência e, principalmente, quantas chamadas a fonte recebeu.",
      },
      {
        id: "b1-e3",
        texto:
          "Subir 2 réplicas em Docker e observar a inconsistência entre elas",
        detalhe:
          "Bata na mesma chave nas duas e veja respostas diferentes. Este é o aprendizado central do assunto, não um efeito colateral: cada réplica tem o próprio cache local e elas divergem. Reproduza até conseguir explicar em voz alta.",
      },
      {
        id: "b1-e4",
        texto: "Trocar por Redis distribuído e medir",
        detalhe: "A divergência some; a latência sobe. Anote quanto.",
      },
      {
        id: "b1-e5",
        texto: "Trocar por HybridCache (L1 + L2) e medir",
        detalhe:
          "Onde ele cai entre os dois — e o que ele faz de diferente quando duas requisições pedem a mesma chave fria.",
      },
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
        prova:
          "O custo real de cada camada; o p99 mostra o que a média esconde",
      },
      {
        id: "b1-m2",
        label: "Nº de chamadas que a fonte lenta recebeu em cada configuração",
        prova: "A proteção efetiva. É a medição mais honesta do assunto",
      },
      {
        id: "b1-m3",
        label: "Cache hit ratio no HybridCache",
        unidade: "%",
        prova: "Quanto do tráfego nem chega ao L2",
      },
    ],
    notaObsidian:
      "“Quando cache local basta e quando não basta” — com as próprias palavras, sem copiar. Se a nota sair genérica, a etapa 3 não foi feita de verdade.",
  },
  {
    id: "b2",
    numero: 2,
    titulo: "Resiliência",
    duracaoSemanas: [4, 5],
    intro: [
      "O assunto que mais rende no trabalho, porque é o único cujos conceitos mapeiam direto em incidentes que você já viveu. Ao terminar, você vai olhar para os BOs dos sistemas da SLC e reconhecer o padrão que faltava em cada um.",
      "A ordem importa: primeiro sinta a falha em cascata, depois estude os padrões. Ao contrário, cada padrão vira cerimônia que você aplica sem saber contra o quê.",
    ],
    conceitos: [
      {
        termo: "timeout",
        definicao:
          "O limite de quanto você espera. O mais barato e o mais esquecido: sem ele, uma dependência lenta prende suas threads e derruba o serviço inteiro sem nunca dar erro.",
      },
      {
        termo: "retry",
        definicao:
          "Só ajuda contra falha transitória; contra falha real ele multiplica a carga em cima de quem já está caído.",
      },
      {
        termo: "backoff exponencial",
        definicao:
          "Esperar cada vez mais entre as tentativas, para dar chance de recuperação em vez de martelar.",
      },
      {
        termo: "jitter",
        definicao:
          "Aleatoriedade no backoff. Sem ele, todos os clientes que falharam juntos voltam juntos, e o backoff sincroniza a manada em vez de dispersá-la.",
      },
      {
        termo: "circuit breaker",
        definicao:
          "Parar de chamar uma dependência já reconhecida como morta. Troca erro lento por erro rápido — e erro rápido é o que preserva o resto do sistema.",
      },
      {
        termo: "fallback",
        definicao:
          "A resposta degradada. Servir dado velho marcado como velho quase sempre vale mais que um 500.",
      },
      {
        termo: "bulkhead",
        definicao:
          "Isolar recursos por dependência, para que uma chamada externa não consuma todas as threads e leve junto endpoints que nem a usam.",
      },
      {
        termo: "degradação graciosa",
        definicao:
          "O desenho onde perder uma parte custa uma parte, não o todo. É a soma de tudo acima — e o que separa arquitetura de configuração de biblioteca.",
      },
      {
        termo: "idempotência",
        definicao:
          "A mesma operação repetida dá o mesmo resultado. É pré-requisito do retry: sem ela, tentar de novo cria duplicata. Volta no assunto 4.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Resiliência",
        url: "https://fidelissauro.dev/resiliencia/",
        confirmado: true,
        nota: "O Fidelis indica reler o capítulo de cache sob a ótica de resiliência: o assunto 1 vira insumo deste, e o fallback da etapa 6 é literalmente cache.",
      },
      {
        fonte: "mukesh",
        titulo: "Polly · resilience pipelines · HttpClient resiliente",
        confirmado: false,
        nota: "O que interessa é Microsoft.Extensions.Http.Resilience e a composição de pipelines.",
      },
    ],
    roteiro: "roteiro/02-resiliencia.md",
    projeto: {
      nome: "caos-lab",
      resumo:
        "Dois serviços: uma dependência que você sabota e um cliente que precisa sobreviver a ela.",
      porque:
        "Não se estuda resiliência contra um sistema saudável. A flaky-api tem um endpoint de controle — POST /modo com ok, lenta, intermitente ou morta — e você alterna o modo enquanto a carga roda. Sem esse botão, você fica esperando o mundo real falhar na hora certa, e ele não colabora.",
      entra:
        "A flaky-api sabotável, o cliente com pipeline do Polly, um gerador de carga, e as medições em cada modo de falha.",
      foraDe:
        "Banco de dados, mensageria, domínio, autenticação. A resposta da flaky-api pode ser uma string.",
      criterio:
        "Com a flaky-api no modo morta, o cliente responde rápido, com dado marcado como velho, e o endpoint que não depende dela continua normal — e você consegue apontar qual das sete etapas é responsável por cada uma dessas três coisas.",
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
        detalhe:
          "Veja o que muda no serviço inteiro, não só naquele endpoint.",
      },
      {
        id: "b2-e3",
        texto: "Retry com backoff (modo intermitente)",
        detalhe:
          "Depois provoque 100 falhas simultâneas e observe por que, sem jitter, todo mundo tenta ao mesmo tempo — o gráfico de chamadas na flaky-api mostra os degraus.",
      },
      {
        id: "b2-e4",
        texto: "Adicionar jitter e comparar: os degraus viram curva",
        detalhe: "Mesmo teste, mesmo gráfico.",
      },
      {
        id: "b2-e5",
        texto:
          "Circuit breaker: parar de bater numa dependência já reconhecida como morta",
        detalhe:
          "Modo morta. Meça quanto tempo até abrir e, voltando ao modo ok, quanto até fechar.",
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
          "Taxa de erro com a dependência morta — antes e depois de cada padrão",
        unidade: "%",
        prova:
          "O ganho isolado de cada padrão. Meça a cada etapa, não só no fim",
      },
      {
        id: "b2-m2",
        label: "Latência p99 durante a falha",
        unidade: "ms",
        prova:
          "O erro lento que o circuit breaker converte em erro rápido",
      },
      {
        id: "b2-m3",
        label: "Tempo até o circuit breaker abrir e fechar",
        unidade: "s",
        prova: "Que a configuração faz o que você acha que faz",
      },
    ],
    notaObsidian:
      "O que cada padrão protege e o que ele não protege — timeout, retry, circuit breaker e fallback resolvem falhas diferentes. A nota é a tabela que diz qual contra qual.",
    pontesTitulo: "A ponte com o trabalho",
    pontesTrabalho:
      "Ao terminar, classifique os BOs reais dos dois sistemas da SLC nesses padrões: quantos teriam sido evitados por timeout? Por circuit breaker? Por fallback? Quantos foram causados por um retry sem idempotência? Essa lista vira conversa com sênior, argumento de promoção e resposta de entrevista ao mesmo tempo — é o item de maior retorno do plano inteiro e custa uma tarde.",
  },
  {
    id: "b3",
    numero: 3,
    titulo: "Persistência e performance",
    duracaoSemanas: [4, 5],
    intro: [
      "O assunto mais denso em ganho imediato. Quase todo problema de performance em aplicação .NET com banco relacional está em uma das sete coisas deste projetinho, e todas ficam invisíveis até você olhar o SQL que o EF Core gerou.",
      "A regra deste assunto: nunca aceite o número sem ver a query.",
    ],
    conceitos: [
      {
        termo: "change tracking",
        definicao:
          "O EF Core guarda uma cópia de tudo que carregou para saber o que mudou no SaveChanges. Útil na escrita, puro desperdício na leitura.",
      },
      {
        termo: "snapshot",
        definicao:
          "Essa cópia. É por ela que carregar 100 mil linhas para exibir custa o dobro de memória do que deveria.",
      },
      {
        termo: "projeção",
        definicao:
          "Trazer só as colunas que você usa, via Select. Muda o SQL, não só o C#: menos colunas, menos I/O, às vezes um índice que cobre a query inteira.",
      },
      {
        termo: "N+1",
        definicao:
          "Uma query para a lista e mais uma por item. Sintoma: serviço lento com o banco ocioso. Causa: um acesso a navegação dentro de um foreach.",
      },
      {
        termo: "índice",
        definicao:
          "A estrutura que evita varrer a tabela. Índice composto tem ordem, e a ordem errada é quase o mesmo que não ter índice.",
      },
      {
        termo: "plano de execução",
        definicao:
          "O que o banco decidiu fazer. EXPLAIN ANALYZE é o único jeito de saber se o índice foi usado, em vez de torcer.",
      },
      {
        termo: "operações em lote",
        definicao:
          "ExecuteUpdate e ExecuteDelete mandam um comando ao banco em vez de carregar tudo para a memória e devolver.",
      },
      {
        termo: "paginação",
        definicao:
          "O OFFSET grande é armadilha: o banco ainda lê e descarta tudo que pulou. Paginação por chave não tem esse custo.",
      },
      {
        termo: "transação",
        definicao:
          "A unidade que ou acontece inteira ou não acontece. Volta no assunto 4, no outbox.",
      },
      {
        termo: "lazy vs eager loading",
        definicao:
          "Quando a navegação é carregada. Lazy é a fábrica de N+1 mais eficiente já inventada.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Databases",
        url: "https://fidelissauro.dev/databases/",
        confirmado: true,
        nota: "Índices, planos, o que o banco faz por baixo.",
      },
      {
        fonte: "mukesh",
        titulo: "Tracking vs No-Tracking",
        confirmado: true,
        nota: "Por que existe AsNoTrackingWithIdentityResolution e quando ela é obrigatória.",
      },
      {
        fonte: "mukesh",
        titulo: "10 erros de performance no EF Core",
        confirmado: true,
        nota: "A leitura de maior densidade prática do assunto.",
      },
      {
        fonte: "mukesh",
        titulo: "Bulk Operations",
        confirmado: true,
        nota: "ExecuteUpdate / ExecuteDelete.",
      },
      {
        fonte: "mukesh",
        titulo: "EF Core Interceptors",
        confirmado: true,
        nota: "Como você vai logar todo o SQL gerado na etapa 6.",
      },
      {
        fonte: "mukesh",
        titulo: "30 perguntas de EF Core",
        confirmado: true,
        nota: "Use como quiz de calibração no fim, não como leitura no começo. Serve para achar buraco, não para preencher.",
      },
    ],
    roteiro: "roteiro/03-persistencia.md",
    projeto: {
      nome: "bench-ef",
      resumo:
        "Uma tabela com 5 milhões de linhas e um endpoint de listagem que precisa sair de lento para rápido, com o número medido a cada etapa.",
      porque:
        "Nada disso aparece em volume pequeno. Com 10 mil linhas, o AsNoTracking não muda nada, o índice não muda nada e o N+1 responde em 40ms — e você conclui, errado, que esses conceitos são teoria. O volume é o projeto.",
      entra:
        "O seed de 5 milhões de linhas, um endpoint de listagem em cinco versões, um índice composto, um N+1 plantado, e um job de atualização em massa.",
      foraDe:
        "API bonita, cache (é o assunto 1), mensageria, escrita concorrente, migrations elaboradas. Duas tabelas com um relacionamento bastam.",
      criterio:
        "O endpoint da etapa 2 e o da etapa 5 respondem à mesma pergunta com ordens de grandeza de diferença, e você consegue atribuir cada fatia da diferença a uma etapa específica — e o quiz das 30 perguntas não te surpreende mais.",
    },
    etapas: [
      {
        id: "b3-e1",
        texto: "Popular a tabela com 5 milhões de linhas (script de seed)",
        detalhe:
          "Use COPY do Postgres ou inserção em lote; se o seed levar horas, você vai evitar recriá-lo e o projeto trava. Meça quanto ele leva.",
      },
      {
        id: "b3-e2",
        texto:
          "Endpoint de listagem ingênuo — medir tempo e alocação de memória",
        detalhe:
          "Carregando a entidade inteira, com tracking, sem projeção. Pior caso e linha de base.",
      },
      {
        id: "b3-e3",
        texto: "Aplicar AsNoTracking e medir",
        detalhe:
          "Olhe a memória alocada, não só o tempo: é lá que o snapshot aparece.",
      },
      {
        id: "b3-e4",
        texto: "Trocar por projeção com Select e medir",
        detalhe:
          "Compare o SQL gerado antes e depois — mudou o número de colunas, e talvez o plano.",
      },
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
        detalhe:
          "Plante-o dentro de um foreach, ligue o log via interceptor, conte as queries, corrija com Include ou projeção.",
      },
      {
        id: "b3-e7",
        texto: "Job de atualização em massa: ExecuteUpdate vs carregar-e-salvar",
        detalhe: "Atualize um milhão de linhas dos dois jeitos e cronometre.",
      },
    ],
    medicoes: [
      {
        id: "b3-m1",
        label: "Tempo e memória alocada nas etapas 2, 3 e 4",
        unidade: "ms / MB",
        prova: "Onde estava o custo: CPU, alocação ou banco",
      },
      {
        id: "b3-m2",
        label: "Nº de queries geradas antes e depois da correção do N+1",
        prova: "A diferença entre 1 e N+1 dita, não estimada",
      },
      {
        id: "b3-m3",
        label:
          "Custo do plano de execução no Postgres, antes e depois do índice",
        prova: "Que o índice foi usado — o Seq Scan que virou Index Scan",
      },
      {
        id: "b3-m4",
        label: "Tempo do job em massa nas duas abordagens",
        unidade: "s",
        prova:
          "A ordem de grandeza entre ir ao banco e trazer o banco até você",
      },
    ],
    notaObsidian:
      "Por que a mesma query fica ordens de grandeza mais rápida — o que o EF Core estava fazendo por baixo em cada versão. Cole o SQL gerado das cinco versões na nota; daqui a um ano ele vale mais que qualquer parágrafo que você escrever.",
  },
  {
    id: "b4",
    numero: 4,
    titulo: "Mensageria e eventos",
    duracaoSemanas: [4, 5],
    intro: [
      "RabbitMQ já está na sua stack e no seu LinkedIn. Aqui você passa a entender o que hoje usa por convenção — e principalmente a saber o que a fila te obriga a garantir na mão, que a chamada síncrona garantia de graça.",
      "O assunto não é “como publicar uma mensagem”. É: assim que a chamada deixa de ser síncrona, duplicata, ordem e acúmulo passam a ser problema seu.",
    ],
    conceitos: [
      {
        termo: "produtor/consumidor",
        definicao:
          "Quem publica não sabe quem consome, nem se alguém consome, nem quando. Esse desacoplamento é o ganho e é a origem de todo o resto.",
      },
      {
        termo: "idempotência",
        definicao:
          "Processar a mesma mensagem duas vezes tem que dar no mesmo. Não é refinamento: é requisito, porque a entrega dupla vai acontecer.",
      },
      {
        termo: "dead letter queue",
        definicao:
          "Para onde vai a mensagem que o consumidor não consegue processar. Sem DLQ, ou você perde a mensagem ou ela entra em loop infinito.",
      },
      {
        termo: "ordenação",
        definicao:
          "Filas não garantem ordem global, e com múltiplos consumidores a ordem se perde por definição. Ou o processamento tolera desordem, ou você particiona por chave.",
      },
      {
        termo: "at-least-once vs exactly-once",
        definicao:
          "O que os brokers entregam é at-least-once. “Exactly-once” na prática é at-least-once mais idempotência do lado de quem consome.",
      },
      {
        termo: "backpressure",
        definicao:
          "O que acontece quando chega mais rápido do que sai. A fila crescendo é o sintoma; a pergunta é o que o sistema faz antes da memória acabar.",
      },
      {
        termo: "outbox",
        definicao:
          "Gravar no banco e publicar na fila na mesma transação é impossível, então você grava a mensagem numa tabela junto com o dado e publica depois. Resolve a inconsistência que ninguém vê até acontecer.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Comunicação assíncrona e teoria das filas",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
        nota: "A teoria das filas aqui é o que dá sentido ao backpressure da etapa 4.",
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
        "Um produtor, um consumidor, uma fila — e um roteiro de todos os jeitos de errar, cometidos de propósito.",
      porque:
        "O código de publicar e consumir cabe em uma tarde. O assunto não está no código: está nos quatro modos de falha, e cada um precisa ser provocado, porque em desenvolvimento eles nunca aparecem sozinhos. Um projeto que “funciona” não ensina mensageria.",
      entra:
        "RabbitMQ em Docker, um produtor, um consumidor, um banco (só para provar duplicata e para o outbox), DLQ configurada.",
      foraDe:
        "Sagas, event sourcing, múltiplos serviços, esquema de eventos versionado, retry sofisticado. Uma mensagem com dois campos basta.",
      criterio:
        "Você consegue matar o consumidor no meio de um lote de 10 mil, subir de novo, e terminar com o número exato de registros corretos no banco — sem duplicata, sem perda — e explicar qual etapa garante cada uma dessas duas coisas.",
    },
    etapas: [
      {
        id: "b4-e1",
        texto:
          "Separar ingestão de processamento: quem busca publica na fila, quem processa consome",
        detalhe:
          "Dois processos, um broker no meio. É a etapa trivial — não gaste mais que uma semana nela.",
      },
      {
        id: "b4-e2",
        texto:
          "Publicar a mesma mensagem duas vezes de propósito, ver o dado duplicar, implementar idempotência por chave",
        detalhe:
          "Uma tabela de mensagens já processadas, com a chave única, resolve. O ponto é ver a duplicata antes de resolvê-la.",
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
          "Acompanhe a fila crescendo no painel; depois aumente o número de consumidores e veja a ordem se perder. É aqui que a teoria das filas encaixa.",
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
      {
        id: "b4-m1",
        label: "Throughput do consumidor",
        unidade: "msg/s",
        prova: "O teto real, que dita se a fila drena ou cresce",
      },
      {
        id: "b4-m2",
        label: "Tamanho máximo da fila sob carga",
        prova:
          "O backpressure em número: quanto o sistema acumulou antes de recuperar",
      },
      {
        id: "b4-m3",
        label: "Nº de mensagens na DLQ e a causa de cada uma",
        prova:
          "Que a DLQ funciona e que você diagnostica pelo que caiu lá",
      },
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
    intro: [
      "O assunto mais curto e o mais fácil de fazer errado, porque instrumentar dá uma sensação de progresso que não se confirma na hora do incidente. Dashboard bonito não é observabilidade; observabilidade é conseguir responder “o que quebrou?” sem abrir o código.",
      "Por isso este projetinho inteiro é desenhado em torno de um único teste final. As etapas 1 a 4 são preparação; a etapa 5 é o assunto.",
    ],
    conceitos: [
      {
        termo: "log estruturado",
        definicao:
          "Log como campos, não como frase. É a diferença entre procurar texto e fazer pergunta: pedido_id = 4711 só é filtrável se pedido_id for um campo.",
      },
      {
        termo: "correlation id",
        definicao:
          "O identificador que acompanha uma requisição por todos os serviços que ela toca. Sem ele, três serviços produzem três histórias que você não consegue costurar.",
      },
      {
        termo: "métrica",
        definicao:
          "Número agregado ao longo do tempo. Responde “está ruim?” e “desde quando?”, mas nunca “por quê?”.",
      },
      {
        termo: "trace distribuído",
        definicao:
          "A requisição desenhada como uma cascata de spans. Mostra em qual salto o tempo foi embora — costuma ser a peça que falta.",
      },
      {
        termo: "health check",
        definicao:
          "Liveness responde “estou vivo, não me reinicie”; readiness responde “estou pronto, pode mandar tráfego”. Confundir os dois produz reinício em loop no deploy.",
      },
      {
        termo: "os quatro sinais dourados",
        definicao:
          "Latência, tráfego, erros e saturação. Lista mínima: se você não vê os quatro, o dashboard está incompleto, não importa quantos gráficos tenha.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Observabilidade (via sumário de System Design)",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
        nota: "O vocabulário e os quatro sinais.",
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
        "Três serviços encadeados, totalmente instrumentados — e um bug que você planta e depois tem que achar olhando só os dashboards.",
      porque:
        "Observabilidade só se prova sob desconhecimento. O truque é a sabotagem sorteada: escreva de cinco a sete scripts de falha (a fila para de drenar, o banco fica lento, um serviço devolve erro em 10% das vezes, o consumidor trava, o cache para de acertar), numere todos, e execute um sorteado — idealmente dias depois de escrevê-los, ou peça para outra pessoa rodar. Aí sim o cronômetro da etapa 5 mede alguma coisa.",
      entra:
        "Três serviços (API → fila → consumidor), Serilog com log estruturado, OpenTelemetry, um coletor com painel (Aspire Dashboard, Jaeger ou Grafana + Tempo), health checks, e os scripts de sabotagem.",
      foraDe:
        "Alertas, SLO, retenção, custo de armazenamento, painel bonito. Importam em produção e não cabem em três semanas. Os três serviços podem ser bobos — a cadeia é o objeto de estudo.",
      criterio:
        "Você acha a causa de uma sabotagem que não escolheu, em poucos minutos, sem abrir o código — e consegue dizer qual sinal te levou até lá.",
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
        detalhe:
          "Uma requisição, uma cascata de spans, incluindo o tempo parado na fila.",
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
          "Dispare o cronômetro e não abra o editor. Esta etapa é o assunto inteiro. Se não conseguir, a observabilidade não está pronta — volte às etapas 1 a 4, instrumente o que faltou, e sorteie outra sabotagem.",
      },
    ],
    medicoes: [
      {
        id: "b5-m1",
        label: "Tempo até identificar a causa no teste final",
        unidade: "min",
        prova: "A única medida honesta de observabilidade",
      },
      {
        id: "b5-m2",
        label: "Nº de sinais que precisou olhar para chegar lá",
        prova: "Se o caminho até a causa é curto ou se você tateou",
      },
    ],
    medicoesNota:
      "Registre os dois por rodada de sabotagem. A curva ao longo de três ou quatro rodadas diz mais que qualquer número isolado.",
    notaObsidian:
      "O que você precisou olhar para achar a causa no teste final — e o que faltou estar instrumentado. A segunda metade é a mais valiosa: é a lista do que você vai instrumentar de primeira no próximo sistema.",
  },
  {
    id: "b6",
    numero: 6,
    titulo: "Escala e capacidade",
    duracaoSemanas: [4, 4],
    intro: [
      "O último assunto isolado, e o que amarra os outros seis. Escalar não é “subir mais réplicas”: é saber onde está o gargalo, o que acontece quando ele sai do lugar, e até onde o desenho aguenta antes de quebrar.",
      "A frase que você deve conseguir dizer no fim — “este serviço aguenta N req/s e o que quebra primeiro é X” — é uma frase de Staff. Quase ninguém em nível pleno consegue dizê-la sobre o próprio sistema.",
    ],
    conceitos: [
      {
        termo: "capacity planning",
        definicao:
          "Dizer com antecedência quanto o sistema aguenta e o que quebra primeiro. É o entregável deste assunto, não um subproduto.",
      },
      {
        termo: "teoria das filas",
        definicao:
          "A fila cresce sem limite quando a taxa de chegada passa a de atendimento, e a latência dispara antes da saturação total. É a razão de o gráfico virar um joelho e não uma rampa.",
      },
      {
        termo: "gargalo",
        definicao:
          "O recurso que satura primeiro. Só existe um por vez, e otimizar qualquer outro não muda absolutamente nada.",
      },
      {
        termo: "escala horizontal vs vertical",
        definicao:
          "Mais instâncias ou instâncias maiores. Horizontal só funciona se o gargalo não for compartilhado — e o banco quase sempre é.",
      },
      {
        termo: "SPoF",
        definicao:
          "O ponto único de falha. Depois de escalar horizontalmente, os que sobraram ficam evidentes: o banco, o broker, o cache, o balanceador.",
      },
      {
        termo: "degradação sob carga",
        definicao:
          "Como o sistema se comporta passando do limite. Recusar rápido e explicitamente é desejável; ficar lento até morrer não é.",
      },
    ],
    leituras: [
      {
        fonte: "fidelis",
        titulo: "Performance, capacidade e escalabilidade",
        url: "https://fidelissauro.dev/performance-capacidade-escalabilidade/",
        confirmado: true,
        nota: "A leitura principal do assunto.",
      },
      {
        fonte: "fidelis",
        titulo: "SPoF, bulkheads e cell-based architecture (via sumário)",
        url: "https://fidelissauro.dev/system-design-sumario/",
        confirmado: true,
        nota: "O bulkhead volta aqui, agora como decisão de topologia e não de biblioteca.",
      },
    ],
    roteiro: "roteiro/06-escala.md",
    projeto: {
      nome: "carga-lab",
      resumo:
        "Um serviço simples, uma ferramenta de carga, e a caça ao gargalo — que muda de lugar toda vez que você resolve o anterior.",
      porque:
        "O serviço precisa ser simples e instrumentado, não realista: um sistema complicado tem gargalos demais ao mesmo tempo e você não consegue atribuir causa. O desenho mínimo — um endpoint que lê e um que escreve, com as métricas do assunto 5 ligadas — já produz a sequência inteira: satura a CPU, você escala, satura a conexão com o banco, você resolve, satura o disco. Ver o gargalo mudar de lugar três vezes é o assunto.",
      entra:
        "O serviço, Postgres, k6 ou NBomber, instrumentação básica de métricas, escala horizontal em Docker, e o documento de capacity plan.",
      foraDe:
        "Kubernetes, autoscaling, cloud, otimização do código da aplicação. Você está medindo o desenho, não o algoritmo.",
      criterio:
        "Você tem o capacity plan de uma página, sustentado pelas medições, e consegue dizer sem consultar nada: quanto aguenta, o que quebra primeiro, e por que escalar horizontalmente comprou menos do que o esperado.",
    },
    etapas: [
      {
        id: "b6-e1",
        texto:
          "Teste de carga com k6 ou NBomber: achar o ponto onde o serviço degrada",
        detalhe:
          "Suba a carga em degraus e registre latência e taxa de erro em cada degrau. Você procura o joelho da curva, não o ponto onde tudo cai.",
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
          "Ele vai mudar. Repita 1 e 2 depois de escalar — a segunda rodada ensina mais que a primeira, porque agora o gargalo é compartilhado.",
      },
      {
        id: "b6-e4",
        texto: "Mapear os pontos únicos de falha do próprio desenho",
        detalhe:
          "Com N réplicas, o que ainda é um só? Derrube cada um e confirme o que acontece — SPoF suposto não conta.",
      },
      {
        id: "b6-e5",
        texto:
          "Escrever o capacity plan: quantas req/s aguenta e o que quebra primeiro ao passar disso",
        detalhe: "Uma página. Números, não adjetivos.",
      },
    ],
    medicoes: [
      {
        id: "b6-m1",
        label: "RPS máximo antes da degradação",
        unidade: "req/s",
        prova: "O teto do desenho de uma instância",
      },
      {
        id: "b6-m2",
        label: "RPS máximo depois da escala horizontal",
        unidade: "req/s",
        prova:
          "Quanto a escala horizontal comprou — quase nunca é linear",
      },
      {
        id: "b6-m3",
        label: "Onde estava o gargalo em cada rodada",
        prova: "A sequência de gargalos. O registro mais valioso do assunto",
      },
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
    intro: [
      "O único projeto grande do plano, e o último. Aqui os sete assuntos anteriores viram um sistema só.",
      "Este assunto não tem conceito novo — e essa é a regra dele. Se você precisar aprender algo que não está nos sete assuntos anteriores, o escopo está errado. O que se aprende aqui não é uma técnica: é o que acontece quando as técnicas se encontram.",
    ],
    conflitos: [
      {
        par: "TTL vs invalidação por evento",
        efeito:
          "A cotação nova chega pela fila e devia invalidar o cache. Mas o cache tem TTL de 60s. Quem manda? Se o evento invalida, o TTL vira teto de segurança e não regra — e você precisa saber dizer isso.",
      },
      {
        par: "retry vs idempotência",
        efeito:
          "O retry do assunto 2, aplicado ao publisher do assunto 4, publica a mensagem duas vezes. As duas soluções que você aprendeu separadas se atrapalham.",
      },
      {
        par: "fallback stale vs contrato de frescor",
        efeito:
          "O circuit breaker serve a última cotação do cache. Mas o contrato diz “no máximo 5 minutos de atraso”. Qual vence quando a fonte cai por meia hora, e o que a resposta declara?",
      },
      {
        par: "outbox vs escrita em massa",
        efeito:
          "O ExecuteUpdate do assunto 3 não passa pelo change tracker, então o outbox não enxerga a escrita. O padrão que estava certo sozinho fica errado acompanhado.",
      },
      {
        par: "cache distribuído vs escala horizontal",
        efeito:
          "O Redis que resolveu a divergência entre réplicas no assunto 1 é, no assunto 6, um SPoF. Você resolveu um problema criando outro e não tinha como ver isso antes.",
      },
      {
        par: "correlation id vs todas as camadas",
        efeito:
          "O trace precisa atravessar cache hit, retry, fila e outbox. Cada camada nova é um lugar a mais onde o id se perde silenciosamente.",
      },
    ],
    conflitosFecho:
      "Nenhum desses seis aparece num projeto isolado. Todos aparecem em produção.",
    conceitosTitulo: "Por que o domínio volta",
    conceitos: [
      {
        termo: "o domínio do assunto 0, agora para valer",
        definicao:
          "A cotação de commodity foi o esqueleto descartável do assunto 0, quando você não sabia nada. Agora é o exercício final, e a diferença entre as duas versões é literalmente tudo que você aprendeu — comparar precos-api com cotacao é o retrato mais honesto de dois anos.",
      },
      {
        termo: "exige os sete naturalmente",
        definicao:
          "Sem requisito inventado: a cotação vem de fora (resiliência), é lida muito mais do que escrita (cache), acumula histórico (persistência), dispara reação quando muda (mensageria), precisa ser diagnosticável (observabilidade) e tem um teto de carga que você vai ter que declarar (escala).",
      },
    ],
    leituras: [],
    leiturasNota:
      "Nada novo. Releia as próprias notas dos sete assuntos anteriores, na ordem, antes de desenhar — especialmente as de cache, resiliência e mensageria, que são as que mais brigam entre si. Se alguma nota estiver vaga a ponto de não te ajudar aqui, é sinal de que aquele assunto não fechou de verdade: volte ao projetinho dele antes de continuar.",
    roteiro: "roteiro/07-integracao.md",
    projeto: {
      nome: "cotacao",
      resumo:
        "Um serviço de cotação de commodity de ponta a ponta: ingestão resiliente de uma fonte externa, histórico grande e consultável, eventos publicados com garantia, leitura sob carga com cache, tudo instrumentado e com capacity plan.",
      porque:
        "Cada projetinho anterior te deu um conceito limpo, isolado, com o número medido. Nenhum deles te mostrou a coisa que mais importa em nível Staff: os padrões se contradizem. Isolado, cada decisão é óbvia; junto, cada uma invalida outra.",
      entra:
        "Ingestão resiliente, persistência com histórico grande e leitura otimizada, outbox e consumidor idempotente, cache na leitura com invalidação por evento, instrumentação ponta a ponta, teste de carga, capacity plan e o design doc.",
      foraDe:
        "Autenticação de verdade, multi-tenant, front-end, cloud, Kubernetes, CI/CD elaborado, e qualquer conceito que não esteja nos sete assuntos. A tentação é usar o projeto grande para aprender mais uma coisa — não faça: escopo novo é a forma mais comum de nunca terminá-lo.",
      criterio:
        "O sistema roda por 24 horas com a fonte externa sendo sabotada em horários que você não escolheu, e no fim você mostra: nenhuma cotação perdida, nenhuma duplicada, o frescor dentro do contrato declarado — e um design doc onde cada decisão tem um número medido atrás dela.",
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
        texto: "Design doc de 2 páginas, comparado com o diagrama da etapa 1",
        detalhe:
          "Arquitetura, decisões, trade-offs, limites — cada afirmação sustentada por uma medição registrada. Termine dizendo o que você desenhou errado na etapa 1, e por quê.",
      },
    ],
    medicoes: [
      {
        id: "b7-m1",
        label: "Latência p99 da leitura com o sistema inteiro ligado",
        unidade: "ms",
        prova:
          "Comparada com o p99 do cache-lab isolado, a diferença é o custo da integração — e ele nunca é zero",
      },
      {
        id: "b7-m2",
        label: "Frescor: da cotação chegar na fonte até ficar visível na leitura",
        unidade: "s",
        prova:
          "O contrato que o sistema realmente cumpre, não o que você esperava",
      },
      {
        id: "b7-m3",
        label: "Taxa de erro e frescor com a fonte externa morta por 30 min",
        unidade: "% / min",
        prova:
          "Que resiliência e cache trabalham juntos, e onde o fallback começa a mentir",
      },
      {
        id: "b7-m4",
        label: "RPS máximo do sistema inteiro e qual componente saturou",
        unidade: "req/s",
        prova:
          "O gargalo do conjunto, que quase nunca é o gargalo de nenhuma peça sozinha",
      },
      {
        id: "b7-m5",
        label:
          "Os conflitos entre padrões que você resolveu, e a decisão de cada um",
        prova:
          "O registro mais valioso do plano inteiro. Escreva a lista, não o número",
      },
    ],
    medicoesNota:
      "Todas as medições aqui são de sistema inteiro. O valor delas está na comparação com as medições isoladas que você já tem anotadas.",
    notaObsidian:
      "Onde os sete assuntos se contradisseram e como você decidiu. As outras seis notas são de sênior: dizem que você entende um conceito. Esta é de Staff: diz que você sabe escolher entre dois conceitos certos que não cabem juntos, e justificar a escolha com um número.",
    pontesTitulo: "A ponte com o trabalho — e com o T9",
    pontesTrabalho:
      "O cotacao e o design doc dele são a peça central do currículo, do LinkedIn e das mock interviews. Não é portfólio decorativo: é o material sobre o qual você vai ser entrevistado, e você tem os números para sustentar cada frase. “Por que vocês usaram X?” raramente tem resposta boa; “por que X em vez de Y, sabendo que custaria Z” tem — e é essa que você vai ter escrito.",
  },
];

export const blocoById = new Map(blocos.map((b) => [b.id, b]));

export const ALL_ETAPAS = blocos.flatMap((b) => b.etapas);
export const ALL_MEDICOES = blocos.flatMap((b) => b.medicoes);

export const MUKESH_BLOG_URL = "https://codewithmukesh.com/blog/";
export const FIDELIS_URL = "https://fidelissauro.dev/system-design-sumario/";

// Com a URL do repositório preenchida, o caminho do roteiro em cada assunto
// vira link para o .md no GitHub. Vazio, aparece como texto — melhor que link
// morto.
export const REPO_BLOB_URL =
  "https://github.com/GabrielTernesSan/cronograma-staff/blob/main/";
