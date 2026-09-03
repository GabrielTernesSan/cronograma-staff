"use client";

import { useApp } from "@/lib/app-context";
import { trilhas } from "@/lib/data/cronograma";
import { countDone, trilhaItemIds } from "@/lib/stats";
import type { Trilha } from "@/lib/types";
import { Bar } from "./Bar";
import { TaskRow } from "./TaskRow";

export function TrilhasSection() {
  return (
    <section id="trilhas" className="scroll-mt-6 border-t border-line pt-11">
      <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">
        Trilhas paralelas
      </h2>
      <p className="mb-5 mt-1.5 max-w-[62ch] text-muted">
        Correm fora dos assuntos, com progresso próprio. Não competem com os
        projetinhos na barra principal.
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
    <div className="border border-line bg-surface px-5 py-4">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-bold">
          {trilha.icon} {trilha.titulo}
        </h3>
        <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted">
          {nDone}/{ids.length}
        </span>
      </div>

      <Bar value={nDone} total={ids.length} className="mt-2.5" height={4} />

      <p className="mt-3.5 text-[15px] leading-relaxed text-muted">
        {trilha.regra}
      </p>

      {trilha.aviso && (
        <p className="mt-3 border-l-2 border-warn bg-surface2 px-4 py-2 text-[14px] leading-relaxed text-warn">
          {trilha.aviso}
        </p>
      )}

      {trilha.itens && (
        <div className="mt-3">
          {trilha.itens.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      )}

      {!trilha.itens && (
        <p className="mt-3 font-mono text-[11px] text-muted">
          progresso somado dos marcos desta trilha nos 10 trimestres
        </p>
      )}
    </div>
  );
}
