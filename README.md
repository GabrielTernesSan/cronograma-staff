# Senior Abroad: Architecture, AI Engineering & Cloud

Roadmap de 36 meses (nov/2026 → out/2029), com oito horas semanais como referência, para chegar a sênior em IA e plataforma, fechar um contrato remoto internacional e sair do Brasil com visto de trabalho.

## O que mudou

- 36 laboratórios mensais em 12 trimestres, divididos em três anos: base sênior com IA, contrato remoto internacional e mudança com visto.
- Os laboratórios técnicos da versão anterior (especificação, Clean Architecture, RAG, agentes, evals, segurança, plataforma, eventos, SRE, governança) continuam; produto, receita e SaaS saíram do caminho principal.
- Novas trilhas de Inglês e Carreira & mudança: portfólio público, entrevistas de system design, busca de vaga, contrato, documentos, visto, saída fiscal e chegada.
- Seção de mercado (o que as vagas pedem em 2026 e leitura de futuro) e tabela de destinos com o salário mínimo de visto de 2026.
- Ritmo de 8h/semana, de quarta a domingo (2h no sábado e 1h30 nos outros dias), com uma grade fixa por pilar no topo da página: checkbox por dia, horas do mês e ofensiva de semanas focadas (6h ou mais).

## Dados e progresso

O conteúdo está em `lib/data/blocos.ts` e `lib/data/cronograma.ts`. A interface está em `components/Roadmap.tsx`.

O progresso é salvo localmente em `cronograma-staff:v4`, com exportação/importação JSON. Ao abrir a nova versão, o estado anterior `cronograma-staff:v3` é preservado no exportável como histórico legado e **não** é contabilizado como avanço no novo roadmap.

## Rodar localmente

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

O plano não marca cursos, materiais, atividades ou evidências como concluídos por padrão.
