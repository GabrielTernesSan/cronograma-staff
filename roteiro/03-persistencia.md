# Assunto 3 — Persistência e performance

**4–5 semanas · T3 (mar–mai/2027), transbordando para o T4**

O assunto mais denso em ganho imediato. Quase todo problema de performance em aplicação
.NET com banco relacional está em uma das sete coisas deste projetinho, e todas ficam
invisíveis até você olhar o SQL que o EF Core gerou.

A regra deste assunto: **nunca aceite o número sem ver a query**.

## Os conceitos

- **Change tracking** — o EF Core guarda uma cópia de tudo que ele carregou para saber
  o que mudou no `SaveChanges`. É útil na escrita e é puro desperdício na leitura.
- **Snapshot** — essa cópia. É por ela que carregar 100 mil linhas para exibir custa o
  dobro de memória do que deveria.
- **Projeção** — trazer só as colunas que você usa, via `Select`. Muda o SQL, não só o
  C#: menos colunas, menos I/O, às vezes um índice que cobre a query inteira.
- **N+1** — uma query para a lista e mais uma por item. O sintoma é o serviço lento com
  o banco ocioso; a causa costuma ser um acesso a navegação dentro de um `foreach`.
- **Índice** — a estrutura que evita varrer a tabela. Índice composto tem ordem, e a
  ordem errada é quase o mesmo que não ter índice.
- **Plano de execução** — o que o banco decidiu fazer. `EXPLAIN ANALYZE` é o único
  jeito de saber se o índice foi usado, em vez de torcer.
- **Operações em lote** — `ExecuteUpdate` e `ExecuteDelete` mandam um comando ao banco
  em vez de carregar tudo para a memória e devolver.
- **Paginação** — o `OFFSET` grande é armadilha: o banco ainda lê e descarta tudo que
  pulou. Paginação por chave não tem esse custo.
- **Transação** — a unidade que ou acontece inteira ou não acontece. Volta no assunto 4,
  no outbox.
- **Lazy vs eager loading** — quando a navegação é carregada. Lazy é a fábrica de N+1
  mais eficiente já inventada.

## O que ler

- **Fidelis — [Databases](https://fidelissauro.dev/databases/)**
  A teoria: índices, planos, o que o banco faz por baixo.
- **Mukesh — Tracking vs No-Tracking (`AsNoTrackingWithIdentityResolution`)**
  Por que existe a variante com identity resolution e quando ela é obrigatória.
- **Mukesh — 10 erros de performance no EF Core**
  A leitura de maior densidade prática do assunto.
- **Mukesh — Bulk Operations**
  `ExecuteUpdate` / `ExecuteDelete`.
- **Mukesh — EF Core Interceptors**
  Como você vai logar todo o SQL gerado no passo 6.
- **Mukesh — 30 perguntas de EF Core**
  ⚠️ Use como **quiz de calibração no fim**, não como leitura no começo. Serve para
  achar buraco, não para preencher.

## O projetinho

### `bench-ef`

Uma tabela com **5 milhões de linhas** e um endpoint de listagem que precisa sair de
lento para rápido, com o número medido a cada passo.

### Por que este projeto

Nada disso aparece em volume pequeno. Com 10 mil linhas, o `AsNoTracking` não muda
nada, o índice não muda nada e o N+1 responde em 40ms — e você conclui, errado, que
esses conceitos são teoria.

O volume é o projeto. É por isso que o passo 1 é só o seed, e é por isso que ele vem
antes de qualquer outra coisa.

### Escopo

**Entra:** o seed de 5 milhões de linhas, um endpoint de listagem em cinco versões, um
índice composto, um N+1 plantado, e um job de atualização em massa.

**Fica de fora:** API bonita, cache (é o assunto 1), mensageria, escrita concorrente,
migrations elaboradas. Duas tabelas com um relacionamento bastam.

**Nada aqui reaproveita o `precos-api`** — a tabela deste projetinho tem uma navegação
de propósito, para o N+1 do passo 6 ter onde nascer.

### Passo a passo

1. **Popular o histórico com 5 milhões de linhas (script de seed).** Use `COPY` do
   Postgres ou inserção em lote; se o seed levar horas, você vai evitar recriá-lo e o
   projeto trava. Meça quanto ele leva.
2. **Endpoint de listagem ingênuo — medir tempo e alocação de memória.** Carregando a
   entidade inteira, com tracking, sem projeção. Este é o pior caso e a linha de base.
3. **Aplicar `AsNoTracking` e medir.** Olhe a memória alocada, não só o tempo: é lá que
   o snapshot aparece.
4. **Trocar por projeção com `Select` e medir.** Compare o SQL gerado antes e depois —
   mudou o número de colunas, e talvez o plano.
5. **Adicionar índice composto (commodity + data) e rodar `EXPLAIN ANALYZE` antes e
   depois.** Depois inverta a ordem das colunas do índice e rode de novo: entender por
   que uma ordem serve e a outra não é metade do valor deste passo.
6. **Criar um N+1 de propósito, encontrá-lo no log de SQL, corrigir.** Plante-o (um
   acesso a navegação dentro do `foreach`), ligue o log de SQL via interceptor, conte
   as queries, corrija com `Include` ou projeção.
7. **Job de atualização em massa: `ExecuteUpdate` vs carregar-e-salvar.** Atualize um
   milhão de linhas dos dois jeitos e cronometre.

### O que medir

| Medição | Unidade | O que o número prova |
|---|---|---|
| Tempo e memória alocada nos passos 2, 3 e 4 | ms / MB | Onde estava o custo: CPU, alocação ou banco |
| Nº de queries geradas antes e depois da correção do N+1 | — | A diferença entre 1 e N+1 dita, não estimada |
| Custo do plano de execução no Postgres, antes e depois do índice | — | Que o índice foi usado — e o `Seq Scan` que virou `Index Scan` |
| Tempo do job em massa nas duas abordagens | s | A ordem de grandeza entre ir ao banco e trazer o banco até você |

### Terminei quando

O endpoint do passo 2 e o do passo 5 respondem à mesma pergunta com ordens de grandeza
de diferença, e você consegue atribuir cada fatia da diferença a um passo específico —
e o quiz das 30 perguntas do Mukesh não te surpreende mais.

## A nota que fica

**Por que a mesma query fica ordens de grandeza mais rápida** — o que o EF Core estava
fazendo por baixo em cada versão. Cole o SQL gerado das cinco versões na nota; daqui a
um ano ele vale mais que qualquer parágrafo que você escrever.
