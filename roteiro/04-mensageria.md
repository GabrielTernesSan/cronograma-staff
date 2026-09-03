# Assunto 4 — Mensageria e eventos

**4–5 semanas · T5 (set–nov/2027), transbordando para o T6**

RabbitMQ já está na sua stack e no seu LinkedIn. Aqui você passa a **entender o que hoje
usa por convenção** — e principalmente a saber o que a fila te obriga a garantir na mão,
que a chamada síncrona garantia de graça.

O assunto não é "como publicar uma mensagem". É: assim que a chamada deixa de ser
síncrona, duplicata, ordem e acúmulo passam a ser problema seu.

## Os conceitos

- **Produtor/consumidor** — quem publica não sabe quem consome, nem se alguém consome,
  nem quando. Esse desacoplamento é o ganho e é a origem de todo o resto.
- **Idempotência** — processar a mesma mensagem duas vezes tem que dar no mesmo. Não é
  refinamento: é requisito, porque a entrega dupla vai acontecer.
- **Dead letter queue** — para onde vai a mensagem que o consumidor não consegue
  processar. Sem DLQ, ou você perde a mensagem ou ela entra em loop infinito.
- **Ordenação** — filas não garantem ordem global, e com múltiplos consumidores a
  ordem se perde por definição. Ou o processamento tolera desordem, ou você particiona
  por chave.
- **At-least-once vs exactly-once** — o que os brokers realmente entregam é
  at-least-once. "Exactly-once" na prática é at-least-once mais idempotência do lado de
  quem consome.
- **Backpressure** — o que acontece quando chega mais rápido do que sai. A fila crescendo
  é o sintoma; a pergunta é o que o sistema faz a respeito antes da memória acabar.
- **Outbox** — gravar no banco e publicar na fila na mesma transação é impossível, então
  você grava a mensagem numa tabela junto com o dado e publica depois. É o padrão que
  resolve a inconsistência que ninguém vê até acontecer.

## O que ler

- **Fidelis — [Comunicação assíncrona e teoria das filas](https://fidelissauro.dev/system-design-sumario/)**
  A teoria das filas aqui é o que dá sentido ao backpressure do passo 4.
- **Mukesh — RabbitMQ, MassTransit e background services**
  ⚠️ *procurar no blog:* endereço não confirmado. Busque por `RabbitMQ` ou
  `MassTransit` em [codewithmukesh.com/blog](https://codewithmukesh.com/blog/).

## O projetinho

### `fila-lab`

Um produtor, um consumidor, uma fila — e um roteiro de **todos os jeitos de errar**,
cometidos de propósito.

### Por que este projeto

O código de publicar e consumir cabe em uma tarde. O assunto não está no código: está
nos quatro modos de falha, e cada um deles precisa ser **provocado**, porque em
desenvolvimento eles nunca aparecem sozinhos.

Por isso os passos 2, 3 e 4 são sabotagens deliberadas: publicar duas vezes, lançar
exceção de propósito, despejar 10 mil mensagens. Um projeto que "funciona" não ensina
mensageria.

### Escopo

**Entra:** RabbitMQ em Docker, um produtor, um consumidor, um banco (só para provar
duplicata e para o outbox), DLQ configurada.

**Fica de fora:** sagas, event sourcing, múltiplos serviços, esquema de eventos
versionado, retry sofisticado. Uma mensagem com dois campos basta.

**Nada aqui reaproveita os projetinhos anteriores.** O banco deste é uma tabela.

### Passo a passo

1. **Separar ingestão de processamento: quem busca publica na fila, quem processa
   consome.** Dois processos, um broker no meio. É o passo trivial — não gaste mais que
   uma semana nele.
2. **Publicar a mesma mensagem duas vezes de propósito, ver o dado duplicar, implementar
   idempotência por chave.** Uma tabela de mensagens já processadas, com a chave única,
   resolve. O ponto é ver a duplicata antes de resolvê-la.
3. **Fazer o consumidor lançar exceção, configurar DLQ, inspecionar o que caiu lá.**
   Antes de configurar a DLQ, veja o que acontece sem ela — a mensagem em loop é a
   lição.
4. **Publicar 10 mil mensagens de uma vez e observar backpressure.** Acompanhe a fila
   crescendo no painel do RabbitMQ; depois aumente o número de consumidores e veja a
   ordem se perder. É aqui que a teoria das filas do Fidelis encaixa.
5. **Padrão outbox: garantir que gravar no banco e publicar na fila não fiquem
   inconsistentes.** Primeiro provoque a inconsistência — mate o processo entre o
   `SaveChanges` e o `Publish` — e só então implemente o outbox.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| Throughput do consumidor | msg/s | O teto real, que dita se a fila drena ou cresce |
| Tamanho máximo da fila sob carga | — | O backpressure em número: quanto o sistema acumulou antes de recuperar |
| Nº de mensagens na DLQ e a causa de cada uma | — | Que a DLQ funciona e que você consegue diagnosticar pelo que caiu lá |

### Terminei quando

Você consegue matar o consumidor no meio de um lote de 10 mil, subir de novo, e terminar
com o número exato de registros corretos no banco — sem duplicata, sem perda — e explicar
qual passo garante cada uma dessas duas coisas.

## A nota que fica

**O que muda quando a chamada deixa de ser síncrona** — o que você ganha e o que passa a
ter que garantir na mão. A segunda metade é a que importa.
