# Assunto 5 — Observabilidade

**3 semanas · T6 (dez/2027–fev/2028)**

O assunto mais curto e o mais fácil de fazer errado, porque instrumentar dá uma sensação
de progresso que não se confirma na hora do incidente. Dashboard bonito não é
observabilidade; observabilidade é conseguir responder **"o que quebrou?"** sem abrir o
código.

Por isso este projetinho inteiro é desenhado em torno de um único teste final. Os
passos 1 a 4 são preparação; o passo 5 é o assunto.

## Os conceitos

- **Log estruturado** — log como campos, não como frase. É a diferença entre procurar
  texto e fazer pergunta: `pedido_id = 4711` só é filtrável se `pedido_id` for um campo.
- **Correlation id** — o identificador que acompanha uma requisição por todos os
  serviços que ela toca. Sem ele, três serviços produzem três histórias que você não
  consegue costurar.
- **Métrica** — número agregado ao longo do tempo. Responde "está ruim?" e "desde
  quando?", mas nunca "por quê?" — para isso existem log e trace.
- **Trace distribuído** — a requisição desenhada como uma cascata de spans. É o que
  mostra em qual salto o tempo foi embora, e costuma ser a peça que falta.
- **Health check** — *liveness* responde "estou vivo, não me reinicie"; *readiness*
  responde "estou pronto, pode mandar tráfego". Confundir os dois produz reinício em
  loop no deploy.
- **Os quatro sinais dourados** — latência, tráfego, erros e saturação. É a lista mínima
  para um serviço: se você não consegue ver os quatro, o dashboard está incompleto,
  não importa quantos gráficos tenha.

## O que ler

- **Fidelis — [Observabilidade](https://fidelissauro.dev/system-design-sumario/)**
  Via sumário de System Design. O vocabulário e os quatro sinais.
- **Mukesh — Serilog, OpenTelemetry e Health Checks**
  ⚠️ *procurar no blog:* endereço não confirmado. Busque por `Serilog`,
  `OpenTelemetry` ou `health check` em
  [codewithmukesh.com/blog](https://codewithmukesh.com/blog/).

## O projetinho

### `caixa-preta`

Três serviços encadeados, totalmente instrumentados — e um bug que você planta e depois
tem que achar **olhando só os dashboards**.

### Por que este projeto

Observabilidade só se prova sob desconhecimento. Se você instrumenta e já sabe onde está
o problema, o teste não vale nada.

O truque deste projetinho é a **sabotagem sorteada**: escreva de cinco a sete scripts de
falha diferentes (a fila para de drenar, o banco fica lento, um serviço passa a devolver
erro em 10% das vezes, o consumidor trava em deadlock, o cache para de acertar), numere
todos, e execute um sorteado — idealmente dias depois de escrevê-los, ou peça para outra
pessoa rodar. Aí sim o cronômetro do passo 5 mede alguma coisa.

### Escopo

**Entra:** três serviços (API → fila → consumidor), Serilog com log estruturado,
OpenTelemetry, um coletor com painel (Aspire Dashboard, Jaeger ou Grafana + Tempo),
health checks, e os scripts de sabotagem.

**Fica de fora:** alertas, SLO, retenção, custo de armazenamento, painel bonito. Esses
importam em produção e não cabem em três semanas.

**Os três serviços podem ser bobos** — a cadeia é o objeto de estudo, não o que ela
calcula.

### Passo a passo

1. **Log estruturado com correlation id atravessando API → fila → consumidor.** O
   correlation id tem que sobreviver ao salto pela fila; é aí que ele costuma se perder,
   porque não viaja sozinho no header HTTP.
2. **Métricas: latência, taxa de erro, cache hit ratio, tamanho da fila.** São os quatro
   sinais dourados traduzidos para esta cadeia.
3. **Trace distribuído com OpenTelemetry, requisição visível ponta a ponta.** Uma
   requisição, uma cascata de spans, incluindo o tempo parado na fila.
4. **Health checks: liveness e readiness separados.** Faça o readiness falhar de
   propósito com a dependência fora e confirme que o liveness continua verde.
5. **Teste final: quebrar algo de propósito e descobrir o que foi olhando só os
   dashboards, sem ler código.** Rode uma sabotagem sorteada, dispare o cronômetro e não
   abra o editor.
   **Este passo é o assunto inteiro.** Se não conseguir, a observabilidade não está
   pronta — volte aos passos 1 a 4, instrumente o que faltou, e sorteie outra sabotagem.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| Tempo até identificar a causa no teste final | min | A única medida honesta de observabilidade |
| Nº de sinais que precisou olhar para chegar lá | — | Se o caminho até a causa é curto ou se você tateou |

Registre os dois **por rodada de sabotagem**. A curva ao longo de três ou quatro rodadas
diz mais que qualquer número isolado.

### Terminei quando

Você acha a causa de uma sabotagem que não escolheu, em poucos minutos, sem abrir o
código — e consegue dizer qual sinal te levou até lá.

## A nota que fica

**O que você precisou olhar para achar a causa no teste final — e o que faltou estar
instrumentado.** A segunda metade é a mais valiosa: é a lista do que você vai
instrumentar de primeira no próximo sistema.
