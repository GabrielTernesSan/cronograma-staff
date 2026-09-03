# Assunto 1 — Cache

**3–4 semanas · T1 (set–nov/2026)**

O primeiro assunto de arquitetura de verdade. Cache é o lugar onde a intuição erra
mais: quase todo mundo sabe pôr um `IMemoryCache` e quase ninguém sabe dizer quando
ele deixa de servir.

O aprendizado central deste assunto não é configurar Redis — é **ver duas réplicas
discordarem** e entender por que isso acontece.

## Os conceitos

- **Cache-aside** — a aplicação consulta o cache, e só vai à fonte se não achar. É o
  padrão default; os outros são exceções a ele.
- **Write-through** — a escrita passa pelo cache e pela fonte juntas. Troca latência
  de escrita por consistência de leitura.
- **TTL** — por quanto tempo o dado vale. É a decisão mais consequente e a mais tomada
  no chute: TTL é a sua tolerância a dado velho, medida em segundos.
- **Invalidação** — expulsar o dado antes do TTL, quando a fonte mudou. "Só existem
  dois problemas difíceis" é piada, mas o motivo é real: você precisa saber que mudou.
- **Stampede** (ou *thundering herd*) — o cache expira e mil requisições vão à fonte
  ao mesmo tempo. O cache que existia para proteger a fonte é quem a derruba.
- **Cache local vs distribuído** — local é rápido e mente; distribuído é consistente e
  custa uma ida na rede. Entender o trade-off é o assunto inteiro.
- **Identity map** — dentro de uma mesma unidade de trabalho, a mesma entidade é o
  mesmo objeto. É cache de escopo curtíssimo, e o EF Core já faz por você (volta no
  assunto 3).
- **Cache hit ratio** — a fração de acertos. Sozinho não diz nada: 99% de hit num dado
  que podia ser errado é pior que 60% num dado correto.

## O que ler

- **Fidelis — [Cache](https://fidelissauro.dev/caching/)**
  A teoria e o vocabulário. Leia antes de escrever qualquer código.
- **Mukesh — [In-Memory Caching em ASP.NET Core](https://codewithmukesh.com/blog/in-memory-caching-in-aspnet-core/)**
  `IMemoryCache`, `GetOrCreateAsync`, políticas de expiração.
- **Mukesh — [Distributed Caching com Redis](https://codewithmukesh.com/blog/)**
  `IDistributedCache` e o que muda ao sair do processo.
- **Mukesh — HybridCache**
  A API do .NET 9+ que junta L1 e L2 e resolve stampede por padrão.
- **Mukesh — EF Core Second-Level Caching**
  Leitura de contexto: onde o cache encosta no ORM. Volta no assunto 3.

## O projetinho

### `cache-lab`

Um serviço com **uma fonte deliberadamente lenta**, na frente da qual você monta
quatro estratégias de cache diferentes e mede as quatro.

### Por que este projeto

Cache só faz sentido contra latência. Para estudar cache você precisa, antes de tudo,
de algo lento — e algo lento **que você controla**, para poder mudar a lentidão e ver o
efeito.

Por isso a fonte não é uma API pública de verdade: é um segundo serviço seu, que dorme
300ms antes de responder e conta quantas vezes foi chamado. Esse contador é a medição
mais importante do assunto, e uma API de terceiros nunca te daria.

### Escopo

**Entra:** o serviço de leitura, a fonte lenta com contador, quatro configurações de
cache (nenhum, `IMemoryCache`, Redis, `HybridCache`), duas réplicas em Docker, e um
gerador de carga simples.

**Fica de fora:** escrita, invalidação por evento, banco de dados, autenticação,
domínio interessante. O dado pode ser `{ id, valor }` — quanto mais burro, melhor.

**Nada aqui reaproveita o `precos-api`.** Comece do zero.

### Passo a passo

1. **Subir a fonte lenta e o serviço de leitura, e medir sem cache nenhum, sob carga.**
   A fonte dorme 300ms e expõe quantas chamadas recebeu. Esta é a linha de base — sem
   ela, todas as outras medições não dizem nada.
2. **Adicionar `IMemoryCache` com `GetOrCreateAsync` e medir de novo.** Compare
   latência e, principalmente, quantas chamadas a fonte recebeu.
3. **Subir 2 réplicas em Docker e observar a inconsistência entre elas.** Bata na
   mesma chave nas duas e veja respostas diferentes. **Este é o aprendizado central do
   assunto, não um efeito colateral:** cada réplica tem o próprio cache local e elas
   divergem. Reproduza até conseguir explicar em voz alta.
4. **Trocar por Redis distribuído e medir.** A divergência some; a latência sobe.
   Anote quanto.
5. **Trocar por `HybridCache` (L1 + L2) e medir.** Onde ele cai entre os dois — e o que
   ele faz de diferente quando duas requisições pedem a mesma chave fria.
6. **Provocar stampede: 500 requisições simultâneas com cache frio**, antes e depois da
   proteção. Olhe o contador da fonte: sem proteção ele salta para perto de 500, com
   proteção fica perto de 1.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| Latência p50 e p99 nas 4 configurações | ms | O custo real de cada camada; o p99 mostra o que a média esconde |
| Nº de chamadas que a fonte recebeu em cada configuração | — | A proteção efetiva. É a medição mais honesta do assunto |
| Cache hit ratio no `HybridCache` | % | Quanto do tráfego nem chega ao L2 |

### Terminei quando

Você tem uma tabela com as quatro configurações nas linhas e as medições nas colunas,
e consegue explicar cada número sem consultar o artigo — inclusive por que o Redis
ficou mais lento que o `IMemoryCache` e por que isso pode valer a pena.

## A nota que fica

**"Quando cache local basta e quando não basta"** — com as próprias palavras, sem
copiar. Se a nota sair genérica, o passo 3 não foi feito de verdade.
