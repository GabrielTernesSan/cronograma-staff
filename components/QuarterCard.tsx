"use client";

import { useApp } from "@/lib/app-context";
import { KIND_META, KIND_ORDER } from "@/lib/data/cronograma";
import {
  quarterBlocos,
  quarterDone,
  quarterItemIds,
  quarterTransbordos,
  semanasLabel,
} from "@/lib/stats";
import type { Quarter, TaskKind } from "@/lib/types";
import { Bar } from "./Bar";
import { BlocoCard } from "./BlocoCard";
import { TaskRow } from "./TaskRow";

const HIGHLIGHT: Record<string, string> = {
  marco: "border-ok/50",
  decisao: "border-decisao/50",
};

export function QuarterCard({ quarter }: { quarter: Quarter }) {
  const { done, valores, filters } = useApp();

  const ids = quarterItemIds(quarter);
  const nDone = quarterDone(quarter, done, valores);
  const complete = nDone === ids.length && ids.length > 0;

  const blocos = quarterBlocos(quarter);
  const transbordos = quarterTransbordos(quarter);

  const tasksByKind = KIND_ORDER.map((kind) => ({
    kind,
    tasks: quarter.tasks.filter((t) => {
      if (t.kind !== kind) return false;
      if (filters.onlyPending && done.has(t.id)) return false;
      return true;
    }),
  })).filter((g) => g.tasks.length > 0);

  const border = quarter.highlight ? HIGHLIGHT[quarter.highlight] : "border-line";

  return (
    <section
      id={quarter.id}
      className={`scroll-mt-24 rounded-2xl border ${border} bg-surface p-4 sm:p-5`}
    >
      <header className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-lg font-bold">
            <span className="text-accent">{quarter.label}</span>{" "}
            <span className="text-muted">·</span> {quarter.theme}
          </h3>
          {complete && (
            <span className="rounded-md bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">
              ✓ concluído
            </span>
          )}
          {quarter.highlight && quarter.highlightLabel && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                quarter.highlight === "marco"
                  ? "bg-ok/15 text-ok"
                  : "bg-decisao/15 text-decisao"
              }`}
            >
              {quarter.highlightLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {quarter.period}
          {blocos.length > 0 && (
            <>
              {" · "}
              {blocos.map((b) => semanasLabel(b)).join(" + ")} de bloco
            </>
          )}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Bar value={nDone} total={ids.length} className="flex-1" height={8} />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
            {nDone}/{ids.length}
          </span>
        </div>
      </header>

      {blocos.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            🧱 Blocos do projeto
          </h4>
          <div className="space-y-2">
            {blocos.map((b) => (
              <BlocoCard key={b.id} bloco={b} />
            ))}
          </div>
        </div>
      )}

      {transbordos.length > 0 && (
        <div className="mb-4 space-y-1">
          {transbordos.map((b) => (
            <p key={b.id} className="text-xs text-muted">
              ↳ O{" "}
              <a href={`#${b.id}`} className="text-accent hover:underline">
                bloco {b.numero} · {b.titulo}
              </a>{" "}
              transborda para cá (~2 semanas). Previsto, não falha — o progresso
              dele conta no trimestre de origem.
            </p>
          ))}
        </div>
      )}

      {tasksByKind.map(({ kind, tasks }) => (
        <TaskGroup key={kind} kind={kind} tasks={tasks} />
      ))}

      {quarter.note && (
        <p className="mt-4 rounded-lg border-l-2 border-accent/60 bg-surface2 px-3 py-2 text-sm leading-relaxed text-muted">
          {quarter.note}
        </p>
      )}
    </section>
  );
}

function TaskGroup({
  kind,
  tasks,
}: {
  kind: TaskKind;
  tasks: Quarter["tasks"];
}) {
  const meta = KIND_META[kind];
  return (
    <div className="mb-3">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {meta.icon} {meta.label}
      </h4>
      <div>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}
