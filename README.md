# Cronograma 30 meses — .NET / Arquitetura / Staff

Plano de **set/2026 a fev/2029** com progresso marcável. A espinha são **7 blocos de conceito**, cada um com um escopo de projeto aplicado em cima do mesmo serviço de cotação de commodity. A trilha do [Fidelis](https://fidelissauro.dev/system-design-sumario/) e o blog do [Mukesh](https://codewithmukesh.com/blog/) são material de apoio pendurado em cada bloco — não são mais a espinha.

O contador que manda é **medições registradas**. Horas assistidas premiam consumo passivo; medição é a prova de que a etapa foi executada.

## O que tem aqui

- **7 blocos**, **38 etapas** de projeto e **18 medições** — cada medição é um campo de texto livre onde você digita o número que mediu.
- Um bloco só fecha quando **todas as etapas estão marcadas E todas as medições estão preenchidas**.
- **41 marcos** de arquitetura, trabalho, certificação, inglês, IA e checkpoint, distribuídos em 10 trimestres.
- **4 trilhas paralelas** (Branas, inglês, Azure, trabalho) com progresso próprio, fora da barra do projeto.
- Progresso e medições salvos no **localStorage**, com **exportar/importar JSON** para backup ou troca de máquina.
- Filtro `só pendentes` e `marcar etapas` por bloco.

## Os blocos

| # | Bloco | Semanas | Etapas | Medições |
|---|---|---|---|---|
| 0 | Fundação | 1 | 3 | 0 |
| 1 | Cache | 3–4 | 6 | 3 |
| 2 | Resiliência | 4–5 | 7 | 3 |
| 3 | Persistência e performance | 4–5 | 7 | 4 |
| 4 | Mensageria e eventos | 4–5 | 5 | 3 |
| 5 | Observabilidade | 3 | 5 | 2 |
| 6 | Escala e capacidade | 4 | 5 | 3 |

O bloco 0 é esqueleto, não conceito — ele conta nas etapas, mas não no contador de blocos concluídos (0/6).

## A grade

A conta: 6h/semana = 4h de bloco + 1h de leitura de arquitetura + 1h de inglês. Um trimestre tem ~13 semanas, logo ~52h de bloco. Os 7 blocos custam ~315h, ou ~78 semanas.

| Trimestre | Período | Foco | Paralelo |
|---|---|---|---|
| T1 | set–nov/2026 | Blocos 0 e 1 (Cache) | Staff Framework do Fidelis · inglês 1h |
| T2 | dez/2026–fev/2027 | Bloco 2 (Resiliência) | **Marco:** design doc de 1 página |
| T3 | mar–mai/2027 | Bloco 3 (Persistência) | Feature ponta a ponta no trabalho |
| T4 | jun–ago/2027 | **MARCO 12 MESES** + AZ-104 | Checkpoint escrito · inglês sobe para 2h |
| T5 | set–nov/2027 | Bloco 4 (Mensageria) | Liderar projeto com +1 pessoa |
| T6 | dez/2027–fev/2028 | Bloco 5 (Observabilidade) | Início da AZ-305 |
| T7 | mar–mai/2028 | Bloco 6 (Escala) | Exame AZ-305 |
| T8 | jun–ago/2028 | Design doc de 2 páginas do projeto | **MARCO 24 MESES** · inglês 3h |
| T9 | set–nov/2028 | Mock interviews em inglês | CV e LinkedIn em inglês |
| T10 | dez/2028–fev/2029 | **PONTO DE DECISÃO** | Staff no Brasil vs contractor em dólar |

**T4 e T8 não têm bloco novo, de propósito.** Eles absorvem o transbordo: os blocos 2, 3 e 4 custam ~60h contra 52h de capacidade por trimestre, então cada um escorrega ~2 semanas para o seguinte. Isso é previsto, não falha — o site mostra o transbordo como referência no trimestre seguinte, sem recontar as etapas.

Se um bloco escorregar mais que isso, o ajuste é empurrar a grade, não cortar etapas. Etapa cortada é medição não feita.

## Rodando local

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
npm run typecheck
```

## Deploy no Vercel

1. `git push` para o repositório no GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → importar este repo.
3. O Vercel detecta Next.js sozinho. Sem variável de ambiente, sem banco.

Todo push na branch principal redeploya automaticamente.

## Onde mexer no conteúdo

- `lib/data/blocos.ts` — os 7 blocos: conceitos, leituras, etapas e medições.
- `lib/data/cronograma.ts` — os 10 trimestres, os marcos e as 4 trilhas paralelas.

⚠️ Os **IDs são posicionais** (`b1-e3` = 3ª etapa do bloco 1, `t4-cert-2` = 2º marco de certificação do T4). Se você reordenar ou remover itens no meio de uma lista, o progresso já salvo passa a apontar para o item errado. Para acrescentar, adicione no fim do array.

Uma leitura com `confirmado: false` mostra a badge `link não confirmado` — é o lembrete de que o endereço ainda precisa ser procurado no blog.

## Persistência

O payload no localStorage é `{ version: 2, savedAt, done: string[], valores: Record<string, string> }` sob a chave `cronograma-staff:v2`. `done` são os IDs marcados; `valores` são os textos das medições. O import aceita export sem `valores` sem quebrar.
