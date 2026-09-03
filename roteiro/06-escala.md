# Assunto 6 — Escala e capacidade

**4 semanas · T7 (mar–mai/2028)**

O último assunto, e o que amarra os outros seis. Escalar não é "subir mais réplicas": é
saber **onde está o gargalo**, o que acontece quando ele sai do lugar, e até onde o
desenho aguenta antes de quebrar.

A frase que você deve conseguir dizer no fim — "este serviço aguenta N req/s e o que
quebra primeiro é X" — é uma frase de Staff. Quase ninguém em nível pleno consegue
dizê-la sobre o próprio sistema.

## Os conceitos

- **Capacity planning** — dizer com antecedência quanto o sistema aguenta e o que
  quebra primeiro. É o entregável deste assunto, não um subproduto.
- **Teoria das filas** — a fila cresce sem limite quando a taxa de chegada passa a de
  atendimento, e a latência dispara *antes* da saturação total, não no ponto dela. É a
  razão matemática de por que o gráfico vira um joelho e não uma rampa.
- **Gargalo** — o recurso que satura primeiro. Só existe um por vez, e otimizar
  qualquer outro não muda absolutamente nada.
- **Escala horizontal vs vertical** — mais instâncias ou instâncias maiores. Horizontal
  só funciona se o gargalo não for compartilhado — e o banco quase sempre é.
- **SPoF** — o ponto único de falha. Depois de escalar horizontalmente, os que sobraram
  ficam evidentes: o banco, o broker, o cache, o balanceador.
- **Degradação sob carga** — como o sistema se comporta *passando* do limite. Recusar
  rápido e explicitamente é comportamento desejável; ficar lento até morrer não é.

## O que ler

- **Fidelis — [Performance, capacidade e escalabilidade](https://fidelissauro.dev/performance-capacidade-escalabilidade/)**
  A leitura principal do assunto.
- **Fidelis — [SPoF, bulkheads e cell-based architecture](https://fidelissauro.dev/system-design-sumario/)**
  Via sumário. O bulkhead volta aqui, agora como decisão de topologia e não de
  biblioteca.

## O projetinho

### `carga-lab`

Um serviço simples, uma ferramenta de carga, e a caça ao gargalo — que muda de lugar
toda vez que você resolve o anterior.

### Por que este projeto

O serviço precisa ser **simples e instrumentado**, não realista. Um sistema complicado
tem gargalos demais ao mesmo tempo e você não consegue atribuir causa.

O desenho mínimo que funciona: um endpoint que lê do banco e um que escreve, com as
métricas do assunto 5 ligadas. Só isso já produz a sequência inteira — primeiro satura
a CPU da aplicação, você escala, aí satura a conexão com o banco, você resolve, aí
satura o disco. **Ver o gargalo mudar de lugar três vezes é o assunto.**

### Escopo

**Entra:** o serviço, Postgres, k6 ou NBomber, instrumentação básica de métricas,
escala horizontal em Docker, e o documento de capacity plan.

**Fica de fora:** Kubernetes, autoscaling, cloud, otimização do código da aplicação.
Você está medindo o desenho, não o algoritmo.

**Este projetinho reaproveita uma coisa dos anteriores:** a instrumentação de métricas
do assunto 5 — não o código, o *aprendizado*. Sem métrica, o passo 2 é impossível e
você fica adivinhando.

### Passo a passo

1. **Teste de carga com k6 ou NBomber: achar o ponto onde o serviço degrada.** Suba a
   carga em degraus e registre latência e taxa de erro em cada degrau. Você procura o
   joelho da curva, não o ponto onde tudo cai.
2. **Identificar o gargalo real usando as métricas do assunto 5 — banco? dependência
   externa? CPU?** Não chute. Se você não consegue provar qual recurso saturou, o passo
   é instrumentar mais, não escalar.
3. **Escalar horizontalmente, medir de novo, verificar se o gargalo mudou de lugar.**
   Ele vai mudar. Repita 1 e 2 depois de escalar — a segunda rodada ensina mais que a
   primeira, porque agora o gargalo é compartilhado.
4. **Mapear os pontos únicos de falha do próprio desenho.** Com N réplicas, o que ainda
   é um só? Derrube cada um e confirme o que acontece — SPoF suposto não conta.
5. **Escrever o capacity plan: quantas req/s aguenta e o que quebra primeiro ao passar
   disso.** Uma página. Números, não adjetivos.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| RPS máximo antes da degradação | req/s | O teto do desenho de uma instância |
| RPS máximo depois da escala horizontal | req/s | Quanto a escala horizontal realmente comprou — quase nunca é linear |
| Onde estava o gargalo em cada rodada | — | A sequência de gargalos. É o registro mais valioso do assunto |

### Terminei quando

Você tem o capacity plan de uma página, sustentado pelas medições, e consegue dizer sem
consultar nada: quanto aguenta, o que quebra primeiro, e por que escalar horizontalmente
comprou menos do que o esperado.

## A nota que fica

**Onde estava o gargalo, por que ele mudou de lugar ao escalar, e qual é o limite honesto
do desenho.**

---

## E depois: o [assunto 7](07-integracao.md)

Terminado o assunto 6, você tem sete conceitos entendidos isoladamente e sete conjuntos
de medições. Falta a parte que nenhum projeto isolado ensina: **o que acontece quando eles
se encontram**.

É o assunto 7 — `cotacao`, o único projeto grande do plano, onde o Redis que resolveu a
divergência entre réplicas no assunto 1 vira SPoF no assunto 6, e o retry do assunto 2
publica mensagem duplicada no assunto 4. Ele termina no design doc de 2 páginas.
