"use client";

import { useApp } from "@/lib/app-context";
import { trilhas } from "@/lib/data/cronograma";
import { countDone, trilhaItemIds } from "@/lib/stats";
import type { Trilha } from "@/lib/types";
import { Bar } from "./Bar";
import { TaskRow } from "./TaskRow";

export function TrilhasSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-base font-bold tracking-tight">
        Trilhas paralelas
      </h2>
      <p className="mb-4 text-sm text-muted">
        Correm fora dos blocos, com progresso próprio. Não competem com o
        projeto na barra principal.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {trilhas.map((t) => (
          <TrilhaCard key={t.id} trilha={t} />
        ))}
      </div>
    </section>
  );
}

function TrilhaCard({ trilha }: { trilha: Trilha }) {
  const { done } = useApp();
  const ids = trilhaItemIds(trilha);
  const nDone = countDone(ids, done);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold">
          {trilha.icon} {trilha.titulo}
        </h3>
        <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-muted">
          {nDone}/{ids.length}
        </span>
      </div>

      <Bar value={nDone} total={ids.length} className="mt-2" />

      <p className="mt-3 text-sm leading-relaxed text-muted">{trilha.regra}</p>

      {trilha.aviso && (
        <p className="mt-2 rounded-lg border-l-2 border-warn/60 bg-surface2 px-3 py-2 text-xs leading-relaxed text-warn">
          ⚠️ {trilha.aviso}
        </p>
      )}

      {trilha.itens && (
        <div className="mt-2">
          {trilha.itens.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      )}

      {!trilha.itens && (
        <p className="mt-2 text-xs text-muted">
          Progresso somado dos marcos desta trilha ao longo dos 10 trimestres.
        </p>
      )}
    </div>
  );
}
