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
import { TaskRow } from "./TaskRow";

const HIGHLIGHT: Record<string, string> = {
  marco: "border-ok",
  decisao: "border-decisao",
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
      className={`scroll-mt-6 border ${border} bg-surface px-5 py-4`}
    >
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-[17px] font-bold">
            <span className="font-mono text-accent">{quarter.label}</span>{" "}
            <span className="text-muted">·</span> {quarter.theme}
          </h3>
          {complete && (
            <span className="bg-ok/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ok">
              concluído
            </span>
          )}
          {quarter.highlight && quarter.highlightLabel && (
            <span
              className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                quarter.highlight === "marco"
                  ? "bg-ok/15 text-ok"
                  : "bg-decisao/15 text-decisao"
              }`}
            >
              {quarter.highlightLabel}
            </span>
          )}
          <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted">
            {nDone}/{ids.length}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-muted tabular-nums">
          {quarter.period}
        </p>
        <Bar value={nDone} total={ids.length} className="mt-3" height={4} />
      </header>

      {blocos.length > 0 && (
        <div className="mt-4">
          <p className="label mb-1.5">O assunto do trimestre</p>
          <div className="flex flex-col gap-1">
            {blocos.map((b) => (
              <a
                key={b.id}
                href={`#${b.id}`}
                className="group flex items-baseline gap-2 text-[15px] hover:underline"
              >
                <span className="font-mono text-[11px] font-bold text-accent tabular-nums">
                  {String(b.numero).padStart(2, "0")}
                </span>
                <span className="font-medium">{b.titulo}</span>
                <span className="font-mono text-[11px] text-muted">
                  {semanasLabel(b)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {transbordos.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {transbordos.map((b) => (
            <p key={b.id} className="text-[13.5px] leading-snug text-muted">
              ↳ O{" "}
              <a href={`#${b.id}`} className="text-accent hover:underline">
                assunto {b.numero} · {b.titulo}
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
        <p className="mt-4 border-l-2 border-accent bg-surface2 px-4 py-2.5 text-[14.5px] leading-relaxed text-muted">
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
    <div className="mt-4">
      <p className="label mb-1">
        {meta.icon} {meta.label}
      </p>
      <div>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}
