# Assunto 7 — Integração

**8–10 semanas · T8 (jun–ago/2028) · marco 24 meses**

O único projeto grande do plano, e o último. Aqui os sete assuntos anteriores viram um
sistema só.

Este assunto não tem conceito novo — e essa é a regra dele. **Se você precisar aprender
algo que não está nos sete assuntos anteriores, o escopo está errado.** O que se aprende
aqui não é uma técnica: é o que acontece quando as técnicas se encontram.

## Por que este assunto existe

Cada projetinho anterior te deu um conceito limpo, isolado, com o número medido. Nenhum
deles te mostrou a coisa que mais importa em nível Staff: **os padrões se contradizem.**

Isolado, cada decisão é óbvia. Junto, cada uma invalida outra:

| Onde conflita | O que acontece |
|---|---|
| **TTL vs invalidação por evento** | A cotação nova chega pela fila e devia invalidar o cache. Mas o cache tem TTL de 60s. Quem manda? Se o evento invalida, o TTL vira teto de segurança e não regra — e você precisa saber dizer isso. |
| **Retry vs idempotência** | O retry do assunto 2, aplicado ao publisher do assunto 4, publica a mensagem duas vezes. As duas soluções que você aprendeu separadas se atrapalham. |
| **Fallback stale vs contrato de frescor** | O circuit breaker serve a última cotação do cache. Mas o contrato diz "no máximo 5 minutos de atraso". Qual vence quando a fonte cai por meia hora, e o que a resposta declara? |
| **Outbox vs escrita em massa** | O `ExecuteUpdate` do assunto 3 não passa pelo change tracker, então o outbox não enxerga a escrita. O padrão que estava certo sozinho fica errado acompanhado. |
| **Cache distribuído vs escala horizontal** | O Redis que resolveu a divergência entre réplicas no assunto 1 é, no assunto 6, um SPoF. Você resolveu um problema criando outro e não tinha como ver isso antes. |
| **Correlation id vs todas as camadas** | O trace precisa atravessar cache hit, retry, fila e outbox. Cada camada nova é um lugar a mais onde o id se perde silenciosamente. |

Nenhum desses seis aparece num projeto isolado. Todos aparecem em produção.

## O que ler

Nada novo. Reler as próprias notas dos sete assuntos anteriores, na ordem, antes de
desenhar — especialmente as de cache, resiliência e mensageria, que são as que mais
brigam entre si.

Se alguma nota estiver vaga a ponto de não te ajudar aqui, é sinal de que aquele assunto
não fechou de verdade. Volte ao projetinho dele antes de continuar.

## O projetinho grande

### `cotacao`

Um serviço de cotação de commodity de ponta a ponta: ingestão resiliente de uma fonte
externa, histórico grande e consultável, eventos publicados com garantia, leitura sob
carga com cache, tudo instrumentado e com capacity plan.

### Por que este projeto

O domínio volta de propósito. Ele foi o esqueleto descartável do assunto 0, quando você
não sabia nada — agora ele é o exercício final, e a diferença entre as duas versões é
literalmente tudo que você aprendeu. Comparar `precos-api` com `cotacao` é o retrato mais
honesto de dois anos.

E o domínio serve porque **exige os sete assuntos naturalmente**, sem que você precise
inventar requisito: cotação vem de fora (resiliência), é lida muito mais do que escrita
(cache), acumula histórico (persistência), dispara reação quando muda (mensageria),
precisa ser diagnosticável (observabilidade) e tem um teto de carga que você vai ter que
declarar (escala).

### Escopo

**Entra:** ingestão resiliente, persistência com histórico grande e leitura otimizada,
outbox e consumidor idempotente, cache na leitura com invalidação por evento,
instrumentação ponta a ponta, teste de carga, capacity plan e o design doc.

**Fica de fora:** autenticação de verdade, multi-tenant, front-end, cloud, Kubernetes,
CI/CD elaborado, e **qualquer conceito que não esteja nos sete assuntos**. A tentação
aqui é usar o projeto grande para aprender mais uma coisa. Não faça — este assunto é
sobre consolidar, e escopo novo é a forma mais comum de nunca terminá-lo.

**Este é o único projeto que reaproveita.** Não o código dos projetinhos — as decisões.
Você já sabe qual estratégia de cache escolher e por quê; o trabalho aqui é montá-las
juntas.

### Passo a passo

1. **Desenhar antes de escrever código.** Um diagrama de uma página: os componentes, o
   fluxo de uma cotação da fonte até a resposta, e onde cada um dos sete assuntos entra.
   **Guarde este diagrama** — o passo 8 vai compará-lo com o que você realmente construiu,
   e a diferença é o aprendizado.
2. **Esqueleto e ingestão resiliente** (assuntos 0 e 2). Fonte externa com timeout, retry
   com jitter, circuit breaker e fallback. A fonte pode ser a `flaky-api` do `caos-lab`
   reescrita — você vai precisar sabotá-la de novo.
3. **Persistência: histórico grande e a query de leitura otimizada** (assunto 3). Projeção,
   índice composto, `EXPLAIN ANALYZE`. Sem cache ainda — a linha de base é a query crua.
4. **Outbox e consumidor idempotente** (assunto 4). Aqui aparece o primeiro conflito real:
   a escrita em massa não passa pelo change tracker e o outbox não a vê. Resolva e
   **registre a decisão**.
5. **Cache na leitura, invalidado por evento** (assuntos 1 e 4). Segundo conflito: TTL ou
   evento? Decida, implemente, e prove com medição que a decisão vale — o frescor medido
   no passo seguinte é a prova.
6. **Instrumentar ponta a ponta** (assunto 5). O correlation id tem que sobreviver ao
   cache hit, ao retry, ao salto pela fila e ao outbox. Teste com uma sabotagem sorteada,
   como no `caixa-preta`.
7. **Teste de carga e capacity plan** (assunto 6). Terceiro conflito: o Redis agora é
   SPoF. Derrube-o sob carga e veja o que o sistema faz. Escreva quanto ele aguenta e o
   que quebra primeiro.
8. **O design doc de 2 páginas.** Arquitetura, decisões, trade-offs, limites conhecidos —
   **cada afirmação sustentada por uma medição que você registrou.** Termine comparando-o
   com o diagrama do passo 1: o que você desenhou errado, e por quê.

### O que medir

Todas as medições aqui são de sistema inteiro. O valor delas está na comparação com as
medições isoladas que você já tem anotadas.

| Medição | Unidade | O que o número prova |
|---|---|---|
| Latência p99 da leitura com tudo ligado | ms | Comparada com o p99 do `cache-lab` isolado, a diferença é o custo da integração — e ele nunca é zero |
| Frescor: da cotação chegar na fonte até ficar visível na leitura | s | O contrato que o sistema realmente cumpre, não o que você esperava |
| Taxa de erro e frescor com a fonte externa morta por 30 min | % / min | Que a resiliência e o cache trabalham juntos, e onde o fallback começa a mentir |
| RPS máximo do sistema inteiro e qual componente saturou | req/s | O gargalo do conjunto, que quase nunca é o gargalo de nenhuma peça sozinha |
| Os conflitos entre padrões que você resolveu, e a decisão de cada um | — | O registro mais valioso do plano inteiro. Escreva a lista, não o número |

### Terminei quando

O sistema roda por 24 horas com a fonte externa sendo sabotada em horários que você não
escolheu, e no fim você mostra: **nenhuma cotação perdida, nenhuma duplicada, o frescor
dentro do contrato declarado** — e um design doc onde cada decisão tem um número medido
atrás dela.

## A nota que fica

**Onde os sete assuntos se contradisseram e como você decidiu.**

As outras seis notas são de sênior: elas dizem que você entende um conceito. Esta é de
Staff: ela diz que você sabe escolher entre dois conceitos certos que não cabem juntos, e
justificar a escolha com um número.

É também a nota da qual saem as suas respostas de entrevista. "Por que vocês usaram X?"
raramente tem resposta boa; "por que vocês usaram X *em vez de* Y, sabendo que custaria Z"
tem — e é essa que você vai ter escrito.

---

## O que vem depois (T9 e T10)

O `cotacao` e o design doc dele são a peça central do currículo, do LinkedIn e das mock
interviews do T9. Não é um projeto de portfólio no sentido decorativo: é o material sobre
o qual você vai ser entrevistado, e você tem os números para sustentar cada frase.

**Um aviso de prazo:** o T8 tem ~13 semanas e este assunto custa 8–10. A folga é real, mas
é a mesma folga que absorveria um atraso do ano 2. Se o ano 2 escorregou, este projeto
entra no T9 — e tudo bem, porque as mock interviews do T9 são sobre ele. O que não pode é
cortar etapa: **etapa cortada é medição não feita**, e aqui a medição é o argumento.
