# Cronograma 24 meses — .NET / Arquitetura / Staff

Plano de **set/2026 a ago/2028** com progresso marcável: o curso [.NET Web API: Zero to Hero](https://codewithmukesh.com/courses/dotnet-webapi-zero-to-hero/) do Mukesh **completo, desde o módulo 1**, distribuído ao longo dos 8 trimestres, junto com a trilha de arquitetura do [Fidelis](https://fidelissauro.dev/system-design-sumario/), as certificações Azure e a escala do inglês.

## O que tem aqui

- **151 lições** em 13 módulos, cada uma com checkbox e duração. As ainda não publicadas pelo Mukesh aparecem com a badge `planejada`.
- **43 marcos** de arquitetura, trabalho, certificação, inglês e checkpoint.
- Progresso salvo no **localStorage** do navegador, com **exportar/importar JSON** para backup ou troca de máquina.
- Filtros `só pendentes` e `ocultar planejadas`, e `marcar tudo` por módulo.

## Distribuição do curso

| Trimestre | Período | Módulos | Lições |
|---|---|---|---|
| T1 Fundamento | set–nov/2026 | 01 | 18 |
| T2 Profundidade | dez/2026–fev/2027 | 02 | 24 |
| T3 Azure (AZ-104) | mar–mai/2027 | 03 | 15 |
| T4 Consolidação — marco 12m | jun–ago/2027 | 04, 05 | 19 |
| T5 Arquitetura formal (AZ-305) | set–nov/2027 | 06, 07 | 15 |
| T6 Exame + inglês em escala | dez/2027–fev/2028 | 08 | 16 |
| T7 Preparação de mercado | mar–mai/2028 | 09, 10 | 21 |
| T8 Decisão | jun–ago/2028 | 11, 12, 13 | 23 |

A carga por trimestre é menor justamente nos trimestres de certificação. O módulo 13 (perguntas de entrevista) fica no T8, encostado no ponto de decisão.

## Rodando local

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## Deploy no Vercel

1. `git push` para o repositório no GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → importar este repo.
3. O Vercel detecta Next.js sozinho. Sem variável de ambiente, sem banco.

Todo push na branch principal redeploya automaticamente.

## Onde mexer no conteúdo

- `lib/data/curso.ts` — os 13 módulos e as 151 lições. Quando o Mukesh publicar uma lição hoje planejada, é só remover o `1` no fim da linha dela.
- `lib/data/cronograma.ts` — os 8 trimestres, marcos e links.

⚠️ Os **IDs são posicionais** (`m01-l04` = 4ª lição do módulo 1). Se você reordenar ou remover lições no meio de um módulo, o progresso já salvo passa a apontar para as lições erradas. Para acrescentar, adicione no fim do array do módulo.
