# Cronograma 30 meses — .NET / Arquitetura / Staff

Duas coisas neste repositório:

1. **[`roteiro/`](roteiro/README.md) — o material de estudo.** Sete assuntos, cada um
   com os conceitos explicados, o que ler, e **um projetinho isolado** para revisar
   aquele conceito na prática — mais **um oitavo projeto, grande**, onde os sete se
   encontram e brigam entre si. É aqui que mora o conteúdo.
2. **O site** — o acompanhamento. A grade de set/2026 a fev/2029 com etapas marcáveis e
   medições registráveis, salvo no navegador.

Se os dois discordarem, o roteiro está certo.

## Os assuntos

| # | Assunto | Semanas | O projetinho | Etapas | Medições |
|---|---|---|---|---|---|
| 0 | [Fundação](roteiro/00-fundacao.md) | 1 | `precos-api` — API .NET + Postgres do zero | 3 | 0 |
| 1 | [Cache](roteiro/01-cache.md) | 3–4 | `cache-lab` — uma fonte lenta e quatro estratégias medidas | 6 | 3 |
| 2 | [Resiliência](roteiro/02-resiliencia.md) | 4–5 | `caos-lab` — uma dependência que você sabota | 7 | 3 |
| 3 | [Persistência](roteiro/03-persistencia.md) | 4–5 | `bench-ef` — 5 milhões de linhas e uma query lenta | 7 | 4 |
| 4 | [Mensageria](roteiro/04-mensageria.md) | 4–5 | `fila-lab` — produtor, consumidor e os jeitos de errar | 5 | 3 |
| 5 | [Observabilidade](roteiro/05-observabilidade.md) | 3 | `caixa-preta` — um bug achado só pelo dashboard | 5 | 2 |
| 6 | [Escala](roteiro/06-escala.md) | 4 | `carga-lab` — achar o gargalo e movê-lo | 5 | 3 |
| **7** | **[Integração](roteiro/07-integracao.md)** | **8–10** | **`cotacao` — os sete juntos, num sistema só** | **8** | **5** |

**Os sete primeiros projetinhos são independentes.** Repositório novo, `dotnet new` novo,
`docker compose` novo — nenhum depende do anterior. Um projeto único atravessando 30 meses
vira dívida: você passa a manter o que construiu em vez de estudar o assunto da vez.
Repetir o boilerplate custa duas horas e compra foco total no conceito.

**O assunto 7 é a exceção, e vem no fim de propósito.** Ele não reaproveita o código dos
sete — reaproveita as decisões. Só depois de entender cada conceito sozinho vale a pena
descobrir que eles se contradizem: TTL contra invalidação por evento, retry contra
idempotência, o Redis que resolveu a divergência entre réplicas virando SPoF sob carga.

O que atravessa os 30 meses não é o código — é a pasta de notas e as medições.

## O que o site faz

- **8 assuntos**, **46 etapas** e **23 medições** — cada medição é um campo de texto
  livre onde você digita o número que mediu.
- Um assunto só fecha quando **todas as etapas estão marcadas E todas as medições estão
  preenchidas**. O contador que manda é **medições registradas**: hora assistida premia
  consumo passivo, medição é a prova de que a etapa foi executada.
- **41 marcos** de arquitetura, trabalho, certificação, inglês, IA e checkpoint,
  distribuídos em 10 trimestres.
- **4 trilhas paralelas** (Branas, inglês, Azure, trabalho) com progresso próprio.
- Progresso e medições no **localStorage**, com **exportar/importar JSON** para backup
  ou troca de máquina.
- Filtro `só pendentes` e `marcar etapas` por assunto.

## A grade

6h/semana = 4h de projetinho + 1h de leitura de arquitetura + 1h de inglês. Um trimestre
tem ~13 semanas, logo ~52h. Os sete primeiros assuntos custam ~315h, ou ~78 semanas; o
assunto 7 custa mais ~36h e ocupa o T8.

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

**T4 não tem assunto novo, de propósito.** Ele absorve o transbordo: os assuntos 2, 3 e 4
custam ~60h contra 52h de capacidade por trimestre, então cada um escorrega ~2 semanas
para o seguinte. Isso é previsto, não falha — o site mostra o transbordo como referência
no trimestre seguinte, sem recontar as etapas.

**O T8 carrega o assunto 7 e sobra pouca folga:** 8–10 semanas de projeto contra ~13 de
trimestre. Se o ano 2 escorregou, o assunto 7 entra no T9 — e isso não atrapalha, porque
as mock interviews do T9 são sobre ele.

Se um assunto escorregar mais que isso, o ajuste é empurrar a grade, não cortar etapas.
Etapa cortada é medição não feita.

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

- **`roteiro/*.md`** — o conteúdo de verdade. Mexa aqui primeiro.
- `lib/data/blocos.ts` — o resumo que o site mostra: conceitos, leituras, o projetinho,
  etapas e medições de cada assunto.
- `lib/data/cronograma.ts` — os 10 trimestres, os marcos e as 4 trilhas paralelas.

⚠️ Os **IDs são posicionais** (`b1-e3` = 3ª etapa do assunto 1, `t4-cert-2` = 2º marco de
certificação do T4). Se você reordenar ou remover itens no meio de uma lista, o progresso
já salvo passa a apontar para o item errado. Para acrescentar, adicione no fim do array.

Uma leitura com `confirmado: false` mostra a badge `link não confirmado` — é o lembrete
de que o endereço ainda precisa ser procurado no blog.

Preenchendo `REPO_BLOB_URL` em `lib/data/blocos.ts` (ex.
`https://github.com/user/repo/blob/main/`), o caminho do roteiro em cada card vira link
clicável. Vazio, ele aparece só como texto — melhor que um link morto.

## Persistência

O payload no localStorage é `{ version: 2, savedAt, done: string[], valores: Record<string, string> }`
sob a chave `cronograma-staff:v2`. `done` são os IDs marcados; `valores` são os textos das
medições. O import aceita export sem `valores` sem quebrar.
