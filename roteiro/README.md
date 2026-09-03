# Roteiro de estudo — .NET / Arquitetura / Staff

Sete assuntos, cada um com **o que ler**, **os conceitos que a leitura tem que deixar
claros**, e **um projetinho isolado** para revisar aquele conceito na prática. No fim,
**um oitavo projeto**, grande, onde os sete se encontram e brigam entre si.

O site na raiz deste repositório é o acompanhamento — ele mostra a grade de 30 meses
e guarda o que você marcou. **O conteúdo mora aqui.** Se os dois discordarem, este
diretório está certo.

## Os assuntos

| # | Assunto | Semanas | O projetinho |
|---|---|---|---|
| 0 | [Fundação](00-fundacao.md) | 1 | `precos-api` — uma API .NET + Postgres do zero |
| 1 | [Cache](01-cache.md) | 3–4 | `cache-lab` — uma fonte lenta e quatro estratégias de cache medidas |
| 2 | [Resiliência](02-resiliencia.md) | 4–5 | `caos-lab` — uma dependência que você sabota de propósito |
| 3 | [Persistência e performance](03-persistencia.md) | 4–5 | `bench-ef` — 5 milhões de linhas e uma query que precisa ficar rápida |
| 4 | [Mensageria e eventos](04-mensageria.md) | 4–5 | `fila-lab` — produtor, consumidor e todos os jeitos de errar |
| 5 | [Observabilidade](05-observabilidade.md) | 3 | `caixa-preta` — três serviços e um bug que você acha só pelo dashboard |
| 6 | [Escala e capacidade](06-escala.md) | 4 | `carga-lab` — achar o gargalo, movê-lo, escrever o capacity plan |
| **7** | **[Integração](07-integracao.md)** | **8–10** | **`cotacao` — os sete juntos, num sistema só** |

## Como funciona

**Os sete primeiros projetinhos são independentes.** Repositório novo, `dotnet new`
novo, `docker compose` novo. Nenhum depende do anterior e nenhum precisa sobreviver ao
próximo.

Isso é de propósito. Um projeto grande que atravessa 30 meses vira dívida: você passa
a manter o que construiu em vez de estudar o assunto da vez, e cada conceito novo chega
enterrado sob o acoplamento com os antigos. Repetir o boilerplate custa duas horas e
compra foco total no conceito.

**O assunto 7 é a exceção, e ela vem no fim de propósito.** Ele não reaproveita o código
dos sete — reaproveita as decisões. Só depois de entender cada conceito sozinho é que
vale a pena descobrir que eles se contradizem: TTL contra invalidação por evento, retry
contra idempotência, cache distribuído contra escala horizontal. Ver isso no começo seria
confusão; ver no fim é a lição de Staff do plano inteiro.

O que atravessa os 30 meses não é o código — é a pasta de notas e as medições.

## A regra do que conta

**Medição registrada.** Não hora assistida, não bloco lido.

Cada projetinho termina com números anotados: latência antes e depois, número de
queries, tamanho da fila, RPS até degradar. O número é a prova de que a etapa foi
executada de verdade, e é ele que você vai lembrar daqui a dois anos — não o texto do
artigo.

Um assunto só fecha quando **todas as etapas estão feitas E todas as medições estão
preenchidas**.

## O ritmo

6h por semana: **4h no projetinho**, 1h de leitura de arquitetura, 1h de inglês.

Um trimestre tem ~13 semanas, logo ~52h de projetinho por trimestre. Os sete primeiros
assuntos custam ~315h — cerca de 78 semanas, 18 meses só de prática. O assunto 7 custa
mais ~36h e ocupa o T8 quase inteiro. Com certificações, preparação de mercado e folga,
o plano ocupa 10 trimestres.

## A grade

| Trimestre | Período | Foco | Paralelo |
|---|---|---|---|
| T1 | set–nov/2026 | Assuntos 0 e 1 (Cache) | Staff Framework do Fidelis · inglês 1h |
| T2 | dez/2026–fev/2027 | Assunto 2 (Resiliência) | **Marco:** design doc de 1 página |
| T3 | mar–mai/2027 | Assunto 3 (Persistência) | Feature ponta a ponta no trabalho |
| T4 | jun–ago/2027 | **MARCO 12 MESES** + AZ-104 | Checkpoint escrito · inglês sobe para 2h |
| T5 | set–nov/2027 | Assunto 4 (Mensageria) | Liderar projeto com +1 pessoa |
| T6 | dez/2027–fev/2028 | Assunto 5 (Observabilidade) | Início da AZ-305 |
| T7 | mar–mai/2028 | Assunto 6 (Escala) | Exame AZ-305 |
| T8 | jun–ago/2028 | **Assunto 7 — o sistema inteiro** | **MARCO 24 MESES** · inglês 3h |
| T9 | set–nov/2028 | Mock interviews em inglês | CV e LinkedIn em inglês |
| T10 | dez/2028–fev/2029 | **PONTO DE DECISÃO** | Staff no Brasil vs contractor em dólar |

**T4 não tem assunto novo, de propósito.** Ele absorve o transbordo: os assuntos 2, 3 e
4 custam ~60h contra 52h de capacidade por trimestre, então cada um escorrega ~2 semanas
para o seguinte. Isso é previsto, não falha.

**O T8 carrega o assunto 7 e sobra pouca folga.** São 8–10 semanas de projeto contra ~13
de trimestre. Se o ano 2 escorregou, o assunto 7 entra no T9 — e isso não atrapalha,
porque as mock interviews do T9 são justamente sobre ele.

Se um assunto escorregar mais que isso, o ajuste é empurrar a grade, não cortar etapas.
**Etapa cortada é medição não feita.**

## O material de apoio

- [fidelissauro.dev](https://fidelissauro.dev/system-design-sumario/) — a teoria, o
  porquê, o vocabulário de arquitetura.
- [codewithmukesh.com](https://codewithmukesh.com/blog/) — o como fazer em .NET.

Nenhum dos dois é a espinha. A espinha é o projetinho; eles são o que você lê para
conseguir escrevê-lo.

## O fechamento — [assunto 7](07-integracao.md)

No T8, o único projeto grande do plano: **`cotacao`**, um serviço de ponta a ponta onde
os sete assuntos viram um sistema só. Sem conceito novo — se você precisar aprender algo
que não está nos sete anteriores, o escopo está errado.

O aprendizado dele não é uma técnica: é que **os padrões se contradizem**. O TTL do cache
briga com a invalidação por evento; o retry briga com a idempotência; o Redis que resolveu
a divergência entre réplicas vira SPoF sob carga. Nada disso aparece num projeto isolado,
e tudo isso aparece em produção.

Ele termina num **design doc de 2 páginas** — arquitetura, decisões, trade-offs e limites,
cada afirmação sustentada por uma medição registrada. Esse documento é a peça que se
mostra em entrevista, e é o material sobre o qual você vai ser entrevistado no T9.
