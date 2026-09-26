# Software Architecture, AI Engineering, Cloud & Product

Roadmap de 30 meses, com seis horas semanais como referência, para aprofundar arquitetura de software, fundamentos e engenharia de IA, cloud-native com Azure e produto/negócio.

## O que mudou

- 30 laboratórios mensais orientados a problemas, organizados em 10 trimestres.
- Arquitetura e Formação de IA do Rodrigo Branas, além de *System Design* de Matheus Fidelis, começam em paralelo no mês 1.
- Azure, fundamentos de IA e produto entram progressivamente sem ampliar a referência de seis horas semanais.
- A plataforma interna de publicação de aplicações departamentais é o contexto comum dos laboratórios; a PoC continua explicitamente limitada a aplicações estáticas, e-mail/senha, auditoria e integração Vercel.
- Todo laboratório contém contexto, objetivo, requisitos funcionais e não funcionais, tecnologias sugeridas, alternativas, atividades, uso e validação independente de IA, critérios, evidências e entregáveis.
- *Revenue Architecture*, de Jacco van der Kooij, entra no segundo semestre como trilha de receita e negócio.

## Dados e progresso

O conteúdo está em `lib/data/blocos.ts` e `lib/data/cronograma.ts`. A interface está em `components/Roadmap.tsx`.

O progresso é salvo localmente em `cronograma-staff:v3`, com exportação/importação JSON. Ao abrir a nova versão, o estado anterior `cronograma-staff:v2` é preservado no exportável como histórico legado e **não** é contabilizado como avanço no novo roadmap.

## Rodar localmente

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

O plano não marca cursos, materiais, atividades ou evidências como concluídos por padrão.
