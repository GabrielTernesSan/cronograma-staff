# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal 36-month study roadmap (Next.js 16 App Router, React 19, Tailwind 4, TypeScript strict). UI, code identifiers, comments and commit messages are in Portuguese (`feat: ...`, `fix: ...`); keep that.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run typecheck`: `tsc --noEmit`
- `npm run check:agenda`: the only test suite. `scripts/check-agenda.cjs` is a plain Node script that transpiles the `lib/` `.ts` files on the fly with `typescript` and runs `node:assert` checks on dates, the task queue and the day planner. There's no test runner and no way to run a single test; to check one thing, add or edit an assertion in that script.
- Before committing: `typecheck`, `check:agenda`, `build` (README order).
- Dev only: `?hoje=YYYY-MM-DD` in the URL simulates the current date for the Hoje panel.

## Architecture

**Content lives in code, not in a DB.** `lib/data/`:
- `trilha.ts`: every `Assunto` (topic) built with the `a(mes, slug, ...)` helper. The id `mNN-slug` comes from the *original* month. The `MES` table moves topics to a new month without changing their ids, so saved progress survives a reorder. To move a topic, edit `MES`, not its `a(...)` call.
- `cursos.ts`: `MODULOS`, the course queue. Each item belongs to a `formacao`: a Branas module (`ia`, `arq`), an Alura course (`alura`) or a Portuguese reading (`leitura`) that replaces a Formação IA module already done on the platform. Each one is prepended to the `leituras` of the topic in `assunto` with `curso: true` and its own stable id (`branas-arq-05`, `alura-terraform`, `pt-o-que-e-mcp`). Branas and Alura items become a `vídeo`; readings become an `artigo`, so use `ehVideoCurso`, not `curso`, to tell them apart. In the technical pillars (arquitetura, ia, cloud), every topic reading that is not from `MODULOS` is `opcional`: it stays out of the queue, doesn't gate practice and is never overdue. To move a module, change its `assunto`; the id stays the same.
- `blocos.ts`: the 36 monthly `laboratorios` (`laboratorios[mes - 1]`) and the scenario texts (`CONTEXTO*`).
- `cronograma.ts`: `INICIO`, month boundaries (`inicioMes`/`fimMes`), the weekly grid `SEMANA` (Wed–Sun) plus `DIAS_EXTRAS`, `SESSAO_MIN`, trimestres, materiais, destinos and market data. Each grid part has a `pilar` and a `fonte` (`curso | teoria | pratica | tudo | lab | fixo`) that says which tasks the Hoje panel may put there. The plan's months 1–6 last several calendar months (`DURACAO_CALENDARIO`) because of the course period.
- `agenda.ts`: flattens everything into one ordered queue, `TAREFAS`. Tasks over 60 min are split into ~30-min sessions with ids `baseId~sN`; finishing the last session also marks `baseId` (`idsParaMarcar`). `montarDia` fills each part of a day with pending tasks that match its pilar/fonte. `fonte: "curso"` parts take the next `MODULOS` item in queue order with no month cap (the course queue runs ahead of the months), and the rescue of missed days never takes one (`semCurso`). Practice only comes after the theory for the same topic. `useProgress` runs `completarSessoes` on load and on every save, so a task whose sessions are all done also has its `baseId`: `done.has(baseId)` is the one "done" rule. Unmark a task with `idsDaTarefa` (all its sessions), or the normalization marks it again. A missed day doesn't create a backlog: the next study day picks up from the next pending task.

**Ids are the contract.** Progress is one `Set<string>` of done ids shared by the trilha, labs, agenda, weekly grid and review cards. Renaming or reordering ids loses saved progress.

**Derived views** (pure functions over data + done set): `lib/grade.ts` (weekly grid, phases), `lib/stats.ts`, `lib/atrasos.ts` (what is overdue: days, topics, labs), `lib/revisao.ts` (spaced-repetition cards; clearing a day's queue marks `rev-<dia>`).

**State and sync:**
- `lib/progresso.ts`: `parse`/`saved` define the persisted JSON shape (`version: 5`). `parse` must keep accepting older payloads, defaulting any missing field.
- `lib/useProgress.ts`: client hook. The source of truth is localStorage `cronograma-staff:v4`; the old `v3` state is kept as `legacy` but never counted. Changes are debounced into a PUT to `/api/progresso` with a bearer token kept in localStorage. On load it uses whichever copy, server or local, has the newer `savedAt`.
- `app/api/progresso/route.ts` + `lib/db.ts`: Neon Postgres, a single row `id='default'` holding a jsonb column. GET is public; PUT requires `PROGRESSO_TOKEN`. Env (`.env.local`): `DATABASE_URL`, `PROGRESSO_TOKEN`. `lib/db.ts` is server-only.
- `lib/useHoje.ts`: "freezes" the day's task list in localStorage `cronograma-staff:hoje:v2` the first time the day is opened.
- `lib/app-context.tsx`: `AppProvider`/`useApp` provides progress plus filters. `components/Roadmap.tsx` is the whole UI.

**Import constraint:** everything `check-agenda.cjs` loads (`lib/data/*`, `lib/datas.ts` and what they import) must use relative imports, not the `@/` alias, and may import from client modules only with `import type`. The script resolves modules with plain `require`.

`next.config.ts` sets `agentRules: false` so that Next doesn't write its own AGENTS.md/CLAUDE.md. `roteiro/` is an archive of the old .NET roadmap and isn't used by the app.
