# Assunto 2 — Resiliência

**4–5 semanas · T2 (dez/2026–fev/2027), transbordando para o T3**

Resiliência é o assunto que mais rende no trabalho, porque é o único cujos conceitos
mapeiam direto em incidentes que você já viveu. Ao terminar, você vai olhar para os BOs
dos sistemas da SLC e reconhecer o padrão que faltava em cada um.

A ordem importa: **primeiro sinta a falha em cascata**, depois estude os padrões. Ao
contrário, cada padrão vira cerimônia que você aplica sem saber contra o quê.

## Os conceitos

- **Timeout** — o limite de quanto você espera. É o padrão mais barato e o mais
  esquecido: sem ele, uma dependência lenta prende suas threads e derruba o serviço
  inteiro sem nunca dar erro.
- **Retry** — tentar de novo. Só ajuda contra falha transitória; contra falha real ele
  multiplica a carga em cima de quem já está caído.
- **Backoff exponencial** — esperar cada vez mais entre as tentativas, para dar chance
  de recuperação em vez de martelar.
- **Jitter** — aleatoriedade no backoff. Sem ele, todos os clientes que falharam juntos
  voltam juntos, e o backoff sincroniza a manada em vez de dispersá-la.
- **Circuit breaker** — parar de chamar uma dependência já reconhecida como morta.
  Troca erro lento por erro rápido, e erro rápido é o que preserva o resto do sistema.
- **Fallback** — a resposta degradada quando não dá para responder direito. Servir dado
  velho marcado como velho quase sempre vale mais que um 500.
- **Bulkhead** — isolar recursos por dependência, para que uma chamada externa não
  consuma todas as threads e leve junto endpoints que nem a usam.
- **Degradação graciosa** — o desenho onde perder uma parte custa uma parte, não o todo.
  É a soma de tudo acima, e é o que separa arquitetura de configuração de biblioteca.
- **Idempotência** — a mesma operação repetida dá o mesmo resultado. É **pré-requisito
  do retry**: sem ela, tentar de novo cria duplicata. Volta no assunto 4.

## O que ler

- **Fidelis — [Resiliência](https://fidelissauro.dev/resiliencia/)**
  A base conceitual. O Fidelis indica reler o capítulo de cache sob a ótica de
  resiliência: o assunto 1 vira insumo deste, e o fallback do passo 6 é literalmente
  cache.
- **Mukesh — Polly, resilience pipelines e `HttpClient` resiliente**
  ⚠️ *procurar no blog:* endereço não confirmado. Busque por `Polly` ou
  `resilience` em [codewithmukesh.com/blog](https://codewithmukesh.com/blog/). O que
  interessa é `Microsoft.Extensions.Http.Resilience` e a composição de pipelines.

## O projetinho

### `caos-lab`

Dois serviços: uma **dependência que você sabota** e um **cliente que precisa sobreviver
a ela**.

### Por que este projeto

Não se estuda resiliência contra um sistema saudável. Você precisa de uma dependência
cujo modo de falha seja escolhido por você: lenta agora, intermitente daqui a pouco,
morta em seguida.

Por isso a `flaky-api` tem um endpoint de controle — `POST /modo` com `ok`, `lenta`,
`intermitente` ou `morta` — e você alterna o modo enquanto a carga roda. Sem esse
botão, você fica esperando o mundo real falhar na hora certa, e ele não colabora.

### Escopo

**Entra:** a `flaky-api` sabotável, o cliente com pipeline do Polly, um gerador de
carga, e as medições em cada modo de falha.

**Fica de fora:** banco de dados, mensageria, domínio, autenticação. A resposta da
`flaky-api` pode ser uma string.

**Nada aqui reaproveita o `cache-lab`** — exceto a ideia de um cache trivial em memória
no passo 6, que você reescreve em dez linhas.

### Passo a passo

1. **Apontar para uma URL morta e ver o serviço inteiro cair junto.** Ponto de partida
   obrigatório. Sem sentir a falha em cascata — as threads presas, o serviço inteiro
   parando por causa de um endpoint —, os padrões seguintes viram cerimônia.
2. **Timeout: nunca esperar indefinidamente.** Ponha a `flaky-api` no modo `lenta` e
   veja o que muda no serviço inteiro, não só naquele endpoint.
3. **Retry com backoff.** Modo `intermitente`. Depois provoque 100 falhas simultâneas e
   observe por que, sem jitter, todo mundo tenta ao mesmo tempo — o gráfico de chamadas
   na `flaky-api` mostra os degraus.
4. **Adicionar jitter e comparar.** Mesmo teste, mesmo gráfico. Os degraus viram uma
   curva.
5. **Circuit breaker: parar de bater numa dependência já reconhecida como morta.**
   Modo `morta`. Meça quanto tempo até abrir e, voltando ao modo `ok`, quanto até fechar.
6. **Fallback: servir a última resposta conhecida com `stale: true` na resposta.**
   Um `Dictionary` em memória basta como cache aqui — o ponto é o contrato da resposta
   degradada, não o armazenamento.
7. **Bulkhead: isolar o pool da chamada externa** para que ela não consuma todas as
   threads. Prove com um segundo endpoint que não usa a `flaky-api` e que precisa
   continuar respondendo enquanto ela está morta.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| Taxa de erro do serviço com a dependência morta — antes e depois de cada padrão | % | O ganho isolado de cada padrão. Meça a cada passo, não só no fim |
| Latência p99 durante a falha | ms | O erro lento que o circuit breaker converte em erro rápido |
| Tempo até o circuit breaker abrir e fechar | s | Que a configuração faz o que você acha que faz |

### Terminei quando

Com a `flaky-api` no modo `morta`, o cliente responde rápido, com dado marcado como
velho, e o endpoint que não depende dela continua normal — e você consegue apontar qual
dos sete passos é responsável por cada uma dessas três coisas.

## A nota que fica

**O que cada padrão protege e o que ele não protege.** Timeout, retry, circuit breaker
e fallback resolvem falhas diferentes; a nota é a tabela que diz qual contra qual.

## 💼 A ponte com o trabalho

Ao terminar, **classifique os BOs reais dos dois sistemas da SLC nesses padrões**:
quantos teriam sido evitados por timeout? Por circuit breaker? Por fallback? Quantos
foram causados por um retry sem idempotência?

Essa lista vira conversa com sênior, argumento de promoção e resposta de entrevista ao
mesmo tempo. **É o item de maior retorno do plano inteiro** e custa uma tarde.
